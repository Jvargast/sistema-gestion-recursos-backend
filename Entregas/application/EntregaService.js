import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import sequelize from "../../database/database.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import VentaService from "../../ventas/application/VentaService.js";
import CajaRepository from "../../ventas/infrastructure/repositories/CajaRepository.js";
import ClienteRepository from "../../ventas/infrastructure/repositories/ClienteRepository.js";
import DetallePedidoRepository from "../../ventas/infrastructure/repositories/DetallePedidoRepository.js";
import DocumentoRepository from "../../ventas/infrastructure/repositories/DocumentoRepository.js";
import PagoRepository from "../../ventas/infrastructure/repositories/PagoRepository.js";
import PedidoRepository from "../../ventas/infrastructure/repositories/PedidoRepository.js";
import AgendaViajesRepository from "../infrastructure/repositories/AgendaViajesRepository.js";
import EntregaRepository from "../infrastructure/repositories/EntregaRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";

class EntregaService {
  /* async createEntrega(id_camion, detalles, rut, fechaHoraEntrega) {
    if (!detalles || detalles.length === 0 || !rut || !fechaHoraEntrega) {
      throw new Error("Faltan datos para continuar con la entrega");
    }

    const entregas = [];
    const errores = [];

    // Iniciar una transacción para garantizar atomicidad
    const transaction = await sequelize.transaction();

    try {
      // Validaciones previas
      for (const id_detalle_transaccion of detalles) {
        const inventario = await InventarioCamionRepository.findByDetalle(
          id_detalle_transaccion,
          id_camion
        );

        if (!inventario) {
          errores.push(
            `No se encontró inventario para el detalle ${id_detalle_transaccion} en el camión ${id_camion}`
          );
        } else if (
          inventario.cantidad < inventario.detalleTransaccion.cantidad
        ) {
          errores.push(
            `Stock insuficiente en el inventario para el detalle ${id_detalle_transaccion}`
          );
        }
      }

      // Si hay errores previos, no continuar
      if (errores.length > 0) {
        await transaction.rollback();
        return {
          message: "Errores detectados, no se realizaron entregas",
          entregas: [],
          capacidadRestante: null,
          errores,
        };
      }

      // Procesar cada entrega
      for (const id_detalle_transaccion of detalles) {
        const inventario = await InventarioCamionRepository.findByDetalle(
          id_detalle_transaccion,
          id_camion
        );

        const cantidadAfectada = inventario.detalleTransaccion.cantidad;

        // Crear un Log antes de eliminar o actualizar
        await InventarioCamionLogsRepository.create({
          id_camion: inventario.id_camion,
          id_producto: inventario.id_producto,
          cantidad: cantidadAfectada,
          estado: "Entregado",
          fecha: new Date(),
        });

        // Actualizar o eliminar inventario
        if (cantidadAfectada === inventario.cantidad) {
          await InventarioCamionRepository.delete(
            inventario.id_inventario_camion
          );
        } else {
          await InventarioCamionRepository.update(
            inventario.id_inventario_camion,
            {
              cantidad: inventario.cantidad - cantidadAfectada,
            }
          );
        }

        // Crear el registro de entrega
        const entrega = await EntregaRepository.create({
          id_detalle_transaccion,
          id_usuario_chofer: rut,
          fechaHoraEntrega,
          estadoEntrega: "Entregado",
        });

        // Actualizar el estado del detalle transacción
        await DetalleTransaccionRepository.update(id_detalle_transaccion, {
          estado_producto_transaccion: 6, // Estado de entregado
        });

        entregas.push(entrega);
      }

      // Calcular la capacidad restante del camión después de todas las entregas
      const capacidad = await CamionService.getCurrentCapacity(id_camion);

      // **Llamar al método para verificar y finalizar la agenda**
      const id_agenda_carga = detalles[0].id_agenda_carga; // Obtener la agenda asociada
      if (id_agenda_carga) {
        await AgendaCargaService.verificarYFinalizarAgenda(id_agenda_carga);
      }

      await transaction.commit();

      return {
        message: "Entregas registradas con éxito",
        entregas,
        capacidadRestante: capacidad,
        errores,
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(
        `Error durante la creación de entregas: ${error.message}`
      );
    }
  } */

  async processDelivery(payload) {
    const {
      id_agenda_viaje,
      id_pedido,
      id_chofer,
      productos_entregados,
      insumo_entregados,
      botellones_retorno,
      monto_total,
      id_metodo_pago,
      payment_reference,
      tipo_documento = "boleta",
      notas,
      impuesto,
      descuento_total_porcentaje,
    } = payload;

    const transaction = await sequelize.transaction();

    try {
      const pedido = await PedidoRepository.findById(id_pedido, {
        transaction,
      });
      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      const detalles = await DetallePedidoRepository.findByPedidoId(id_pedido, {
        transaction,
      });

      const cajaChofer = await CajaRepository.findCajaEstadoByUsuario(
        id_chofer,
        "abierta",
        { transaction }
      );
      if (!cajaChofer) {
        throw new Error(`Chofer ${id_chofer} no tiene caja abierta.`);
      }

      const agendaViaje = await AgendaViajesRepository.findByAgendaViajeId(
        id_agenda_viaje,
        {
          transaction,
        }
      );
      if (!agendaViaje) {
        throw new Error("Agenda de viaje no encontrada");
      }

      const isPaid = pedido.pagado;
      let ventaRegistrada = null;

      if (!isPaid) {
        const data = {
          id_cliente: pedido.id_cliente,
          id_vendedor: id_chofer,
          id_caja: cajaChofer.id_caja,
          tipo_entrega: "despacho_a_domicilio",
          direccion_entrega: pedido.direccion_entrega,
          productos: detalles,
          productos_retornables: botellones_retorno,
          id_metodo_pago,
          notas,
          impuesto: impuesto || 0,
          descuento_total_porcentaje: descuento_total_porcentaje || 0,
          tipo_documento,
          referencia: payment_reference,
        };
        ventaRegistrada = await VentaService.createVenta(data, id_chofer, {
          transaction,
        });

        pedido.pagado = true;
        pedido.estado_pago = "Pagado";
        //Agregar estado del pedido a uno que sea Entregado quizás

        await pedido.save({ transaction });
      }
      if (productos_entregados && Array.isArray(productos_entregados)) {
        for (const item of productos_entregados) {
          const reserva =
            await InventarioCamionRepository.findByCamionProductoAndEstado(
              agendaViaje.id_camion,
              item.id_producto,
              "En Camión - Reservado",

              { transaction }
            );
          if (!reserva) {
            throw new Error(
              `No se encontró reserva para el producto ${item.id_producto} en el camión ${agendaViaje.id_camion}`
            );
          }
          if (reserva.cantidad < item.cantidad) {
            throw new Error(
              `Cantidad insuficiente en reserva para el producto ${item.id_producto}`
            );
          }
          if (reserva) {
            reserva.cantidad -= item.cantidad;
            if (reserva.cantidad === 0) {
              await reserva.destroy({ transaction });
            } else {
              await reserva.save({ transaction });
            }
          }
        }
      }
      if (insumo_entregados && Array.isArray(insumo_entregados)) {
        for (const item of insumo_entregados) {
          const reserva =
            await InventarioCamionRepository.findByCamionProductoAndEstado(
              agendaViaje.id_camion,
              item.id_insumo,
              "En Camión - Reservado",
              { transaction }
            );

          if (reserva) {
            reserva.cantidad -= item.cantidad;
            if (reserva.cantidad === 0) {
              await reserva.destroy({ transaction });
            } else {
              await reserva.save({ transaction });
            }
          }
        }
      }
      if (
        botellones_retorno &&
        botellones_retorno.pasados === true &&
        botellones_retorno.items &&
        Array.isArray(botellones_retorno.items)
      ) {
        for (const item of botellones_retorno.items) {
          const registro =
            await InventarioCamionRepository.findByCamionProductoAndEstado(
              agendaViaje.id_camion,
              item.id_producto,
              "En Camión - Retorno",
              { transaction }
            );
          if (!registro) {
            // Si no existe, se crea uno (esto asume que InventarioCamionRepository tiene un método create)
            await InventarioCamionRepository.create(
              {
                id_camion: agendaViaje.id_camion,
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                estado: "En Camión - Retorno",
              },
              { transaction }
            );
          } else {
            registro.cantidad += item.cantidad;
            await registro.save({ transaction });
          }
          /*  registro.cantidad += item.cantidad;
          await registro.save({ transaction }); */
        }
      }

      const nuevaEntrega = await EntregaRepository.create(
        {
          id_agenda_viaje,
          id_camion: agendaViaje.id_camion,
          id_cliente: pedido.id_cliente,
          productos_entregados: productos_entregados || null,
          insumo_entregados: insumo_entregados || null,
          botellones_retorno: botellones_retorno || null,
          es_entrega_directa: false, // según tu lógica de negocio, podrías modificarlo
          monto_total,
          estado_entrega: "completada",
          fecha_hora: new Date(),
          id_documento: isPaid
            ? pedido.id_documento
            : ventaRegistrada.documento.id_documento, // si ya estaba pagado, se asocia el documento
          motivo_fallo: null,
        },
        { transaction }
      );

      await transaction.commit();
      return {
        mensaje: "Entrega registrada con éxito",
        entrega: nuevaEntrega,
        venta: ventaRegistrada,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getEntregaById(id) {
    const entrega = await EntregaRepository.findById(id);
    if (!entrega) {
      throw new Error("Entrega not found");
    }
    return entrega;
  }

  async getAllEntregas(filters = {}, options) {
    const allowedFields = ["id", "fechaHoraEntrega", "estadoEntrega"];
    const where = createFilter(filters, allowedFields);

    const include = [
      {
        model: DetalleTransaccionRepository.getModel(),
        as: "detalleTransaccion",
        include: [
          {
            model: ProductosRepository.getModel(),
            as: "producto",
            attributes: ["id_producto", "nombre_producto", "precio"],
          },
          {
            model: TransaccionRepository.getModel(),
            as: "transaccion",
            include: [
              {
                model: ClienteRepository.getModel(),
                as: "cliente",
                attributes: [
                  "id_cliente",
                  "rut",
                  "nombre",
                  "apellido",
                  "direccion",
                ],
              },
            ],
          },
        ],
      },
      {
        model: UsuariosRepository.getModel(),
        as: "usuario",
        attributes: ["rut", "nombre", "email"],
      },
    ];

    const result = await paginate(EntregaRepository.getModel(), options, {
      where,
      include,
      order: [["id", "ASC"]],
    });

    // Agrupar entregas por transacción
    const groupedByTransaction = result.data.reduce((acc, entrega) => {
      const transactionId =
        entrega.detalleTransaccion.transaccion.id_transaccion;
      const cliente = entrega.detalleTransaccion.transaccion.cliente;
      if (!acc[transactionId]) {
        acc[transactionId] = {
          id_transaccion: transactionId,
          cliente: cliente
            ? {
                rut: cliente.rut,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                direccion: cliente.direccion,
              }
            : null,
          entregas: [],
          usuario: entrega.usuario,
        };
      }
      acc[transactionId].entregas.push({
        id_entrega: entrega.id,
        fechaHoraEntrega: entrega.fechaHoraEntrega,
        estadoEntrega: entrega.estadoEntrega,
        detalle: {
          producto: entrega.detalleTransaccion.producto,
          cantidad: entrega.detalleTransaccion.cantidad,
          subtotal: entrega.detalleTransaccion.subtotal,
        },
      });
      return acc;
    }, {});

    return {
      data: Object.values(groupedByTransaction),
      pagination: result.pagination,
    };
  }

  async getEntregasPorChofer(choferId, options) {
    const include = [
      {
        model: DetalleTransaccionRepository.getModel(),
        as: "detalleTransaccion",
        include: [
          {
            model: ProductosRepository.getModel(),
            as: "producto",
          },
          {
            model: TransaccionRepository.getModel(),
            as: "transaccion",
            include: [
              {
                model: ClienteRepository.getModel(),
                as: "cliente", // Relación cliente en transacción
              },
              {
                model: DocumentoRepository.getModel(),
                as: "documentos",
                include: [
                  {
                    model: PagoRepository.getModel(),
                    as: "pagos",
                    attributes: ["id_pago", "monto", "fecha", "referencia"],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: UsuariosRepository.getModel(),
        as: "usuario",
        attributes: ["rut", "nombre", "email"],
      },
    ];

    const where = choferId ? { id_usuario_chofer: choferId } : {};

    const result = await paginate(EntregaRepository.getModel(), options, {
      where,
      include,
      order: [["id", "ASC"]],
    });

    // Agrupar entregas por chofer
    const agrupadasPorChofer = result.data.reduce((acc, entrega) => {
      const choferKey = entrega.usuario.rut;
      if (!acc[choferKey]) {
        acc[choferKey] = {
          chofer: entrega.usuario,
          transacciones: {},
        };
      }

      const idTransaccion =
        entrega.detalleTransaccion.transaccion.id_transaccion;
      const total = entrega.detalleTransaccion.transaccion.total;
      const documentos =
        entrega.detalleTransaccion.transaccion.documentos || [];
      const pagos = documentos
        ? documentos.flatMap((doc) =>
            doc.pagos.map((pago) => ({
              id_pago: pago.id_pago,
              monto: pago.monto,
              fecha: pago.fecha,
              referencia: pago.referencia,
            }))
          )
        : [];

      // Agrupar entregas dentro de la transacción correspondiente
      if (!acc[choferKey].transacciones[idTransaccion]) {
        acc[choferKey].transacciones[idTransaccion] = {
          id_transaccion: idTransaccion,
          total: total,
          cliente: entrega.detalleTransaccion.transaccion.cliente
            ? {
                nombre: entrega.detalleTransaccion.transaccion.cliente.nombre,
                apellido:
                  entrega.detalleTransaccion.transaccion.cliente.apellido,
                direccion:
                  entrega.detalleTransaccion.transaccion.cliente.direccion,
              }
            : null,
          pago: pagos,
          entregas: [],
        };
      }

      acc[choferKey].transacciones[idTransaccion].entregas.push({
        id_entrega: entrega.id,
        fechaHoraEntrega: entrega.fechaHoraEntrega,
        estadoEntrega: entrega.estadoEntrega,
        producto: entrega.detalleTransaccion.producto.nombre_producto,
        cantidad: entrega.detalleTransaccion.cantidad,
        subtotal: entrega.detalleTransaccion.subtotal,
      });

      return acc;
    }, {});

    // Convertir las transacciones a un array para facilitar el manejo en el frontend
    const data = Object.values(agrupadasPorChofer).map((chofer) => ({
      ...chofer,
      transacciones: Object.values(chofer.transacciones),
    }));

    return {
      data,
      pagination: result.pagination,
    };
  }

  async updateEntrega(id, data) {
    return await EntregaRepository.update(id, data);
  }

  async deleteEntrega(id) {
    return await EntregaRepository.delete(id);
  }
}

export default new EntregaService();

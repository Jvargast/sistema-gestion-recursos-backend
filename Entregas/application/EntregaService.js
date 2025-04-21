import sequelize from "../../database/database.js";
import { obtenerFechaActualChile } from "../../shared/utils/fechaUtils.js";
import paginate from "../../shared/utils/pagination.js";
import VentaService from "../../ventas/application/VentaService.js";
import CajaRepository from "../../ventas/infrastructure/repositories/CajaRepository.js";
import ClienteRepository from "../../ventas/infrastructure/repositories/ClienteRepository.js";
import DetallePedidoRepository from "../../ventas/infrastructure/repositories/DetallePedidoRepository.js";
import DocumentoRepository from "../../ventas/infrastructure/repositories/DocumentoRepository.js";
import EstadoVentaRepository from "../../ventas/infrastructure/repositories/EstadoVentaRepository.js";
import MetodoPagoRepository from "../../ventas/infrastructure/repositories/MetodoPagoRepository.js";
import PedidoRepository from "../../ventas/infrastructure/repositories/PedidoRepository.js";
import VentaRepository from "../../ventas/infrastructure/repositories/VentaRepository.js";
import AgendaViajesRepository from "../infrastructure/repositories/AgendaViajesRepository.js";
import EntregaRepository from "../infrastructure/repositories/EntregaRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";

const fecha = obtenerFechaActualChile();

class EntregaService {
  // Pedido de En Entrega -> Completada
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
      console.log(tipo_documento);
      if (!tipo_documento) {
        throw new Error("El tipo_documento no fue especificado para la venta.");
      }

      const pedido = await PedidoRepository.findById(id_pedido, {
        transaction,
      });
      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      const estadoActual = await EstadoVentaRepository.findById(
        pedido.id_estado_pedido
      );
      const estadoEnEntrega = await EstadoVentaRepository.findByNombre(
        "En Entrega"
      );
      const estadoCompletada = await EstadoVentaRepository.findByNombre(
        "Completada"
      );

      if (!estadoEnEntrega || !estadoCompletada)
        throw new Error("Estados no configurados correctamente.");

      if (estadoActual.nombre_estado !== "En Entrega")
        throw new Error("El pedido no está en estado 'En Entrega'.");

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

      let ventaRegistrada = null;
      let pago_recibido = null;
      let metodo = null;

      if (id_metodo_pago) {
        metodo = await MetodoPagoRepository.findById(id_metodo_pago, {
          transaction,
        });
        if (metodo && metodo.nombre.toLowerCase() === "efectivo") {
          pago_recibido = monto_total;
        }
      }

      if (!pedido.id_venta) {
        const esFactura = tipo_documento === "factura";

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
          pago_recibido,
          id_pedido_asociado: pedido.id_pedido,
        };

        ventaRegistrada = await VentaService.createVenta(data, id_chofer, {
          transaction,
        });

        pedido.id_venta = ventaRegistrada.id_venta;

        if (esFactura) {
          pedido.pagado = false;
          pedido.estado_pago = "Pendiente";
        } else {
          pedido.pagado = true;
          pedido.estado_pago = "Pagado";
        }
      } else {
        // Ya tiene venta asociada
        ventaRegistrada = await VentaRepository.findById(pedido.id_venta, {
          transaction,
        });

        const documento = await DocumentoRepository.findByVentaId(
          pedido.id_venta,
          {
            transaction,
          }
        );

        const tipoDocumento = documento?.[0]?.tipo_documento || "boleta";
        const esFactura = tipoDocumento === "factura";

        pedido.pagado = !esFactura;
        pedido.estado_pago = esFactura ? "Pendiente" : "Pagado";
      }

      pedido.id_estado_pedido = estadoCompletada.id_estado_venta;

      await pedido.save({ transaction });

      if (productos_entregados && Array.isArray(productos_entregados)) {
        for (const item of productos_entregados) {
          const reserva = await InventarioCamionRepository.findParaEntrega(
            agendaViaje.id_camion,
            item.id_producto,
            item.es_retornable || false,
            transaction
          );
          if (!reserva || reserva.cantidad < item.cantidad)
            throw new Error(
              `Inventario insuficiente en camión para producto ${item.id_producto}`
            );

          reserva.cantidad -= item.cantidad;
          reserva.cantidad === 0
            ? await reserva.destroy({ transaction })
            : await reserva.save({ transaction });
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

          if (!reserva || reserva.cantidad < item.cantidad)
            throw new Error(
              `Inventario insuficiente en camión para insumo: ${item.id_insumo}`
            );

          reserva.cantidad -= item.cantidad;
          reserva.cantidad === 0
            ? await reserva.destroy({ transaction })
            : await reserva.save({ transaction });
        }
      }

      if (
        botellones_retorno &&
        botellones_retorno.pasados === true &&
        botellones_retorno.items &&
        Array.isArray(botellones_retorno.items)
      ) {
        for (const item of botellones_retorno?.items) {
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
                tipo: "Retorno",
              },
              { transaction }
            );
          } else {
            registro.cantidad += item.cantidad;
            await registro.save({ transaction });
          }
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
          es_entrega_directa: false,
          monto_total,
          estado_entrega: "completada",
          fecha_hora: fecha,
          id_documento: ventaRegistrada?.documento?.id_documento || null,
          motivo_fallo: null,
          id_pedido: pedido.id_pedido,
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

  async validarEstados(
    pedido,
    estadoActual,
    estadoEnEntrega,
    estadoCompletada
  ) {
    if (!estadoEnEntrega || !estadoCompletada)
      throw new Error("Estados no configurados correctamente.");

    if (estadoActual.nombre_estado !== "En Entrega")
      throw new Error("El pedido no está en estado 'En Entrega'.");
  }

  async getEntregaById(id) {
    const entrega = await EntregaRepository.findById(id);
    if (!entrega) {
      throw new Error("Entrega not found");
    }
    return entrega;
  }

  async getAllEntregas(filters = {}, options) {
    /* const allowedFields = ["id", "fechaHoraEntrega", "estadoEntrega"];
    const where = createFilter(filters, allowedFields);

    const include = [
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
    }; */
  }

  async getEntregasByAgendaId(id_agenda_viaje, options = {}) {
    if (!id_agenda_viaje) {
      throw new Error("ID de agenda de viaje es requerido.");
    }
    const include = [
      {
        model: DocumentoRepository.getModel(),
        as: "documento",

        attributes: [
          "id_documento",
          "tipo_documento",
          "numero",
          "total",
          "fecha_emision",
          "estado",
        ],
      },
      {
        model: PedidoRepository.getModel(),
        as: "pedido",
        attributes: ["id_pedido"],
      },
      {
        model: ClienteRepository.getModel(),
        as: "cliente",
        attributes: [
          "id_cliente",
          "nombre",
          "apellido",
          "razon_social",
          "direccion",
        ],
      },
    ];

    const where = {
      id_agenda_viaje: id_agenda_viaje,
    };

    const result = await paginate(EntregaRepository.getModel(), options, {
      where,
      include,
      attributes: [
        "id_entrega",
        "fecha_hora",
        "estado_entrega",
        "monto_total",
        "productos_entregados",
        "insumo_entregados",
        "botellones_retorno",
        "es_entrega_directa",
      ],
      order: [["fecha_hora", "DESC"]],
    });

    return result;
  }

  async updateEntrega(id, data) {
    return await EntregaRepository.update(id, data);
  }

  async deleteEntrega(id) {
    return await EntregaRepository.delete(id);
  }
}

export default new EntregaService();

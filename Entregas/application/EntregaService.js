import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import sequelize from "../../database/database.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import ClienteRepository from "../../ventas/infrastructure/repositories/ClienteRepository.js";
import DetalleTransaccionRepository from "../../ventas/infrastructure/repositories/DetalleTransaccionRepository.js";
import DocumentoRepository from "../../ventas/infrastructure/repositories/DocumentoRepository.js";
import PagoRepository from "../../ventas/infrastructure/repositories/PagoRepository.js";
import TransaccionRepository from "../../ventas/infrastructure/repositories/TransaccionRepository.js";
import AgendaCargaRepository from "../infrastructure/repositories/AgendaCargaRepository.js";
import EntregaRepository from "../infrastructure/repositories/EntregaRepository.js";
import InventarioCamionLogsRepository from "../infrastructure/repositories/InventarioCamionLogsRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import AgendaCargaService from "./AgendaCargaService.js";
import CamionService from "./CamionService.js";

class EntregaService {
  async createEntrega(id_camion, detalles, rut, fechaHoraEntrega) {
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
  }

  async registrarVentaAdicional({ id_camion, id_producto, cantidad }) {
    if (!id_camion || !id_producto || !cantidad) {
      throw new Error("Faltan datos para registrar la venta adicional");
    }

    const productoEnCamion = await InventarioCamionRepository.findOne({
      where: { id_camion, id_producto, estado: "En Camión - Disponible" },
    });

    if (!productoEnCamion || productoEnCamion.cantidad < cantidad) {
      throw new Error("Stock insuficiente en el inventario del camión");
    }

    // Actualizar el inventario del camión
    const nuevaCantidad = productoEnCamion.cantidad - cantidad;
    await InventarioCamionRepository.update(productoEnCamion.id, {
      cantidad: nuevaCantidad,
      estado: nuevaCantidad === 0 ? "Vendido" : "En Camión - Disponible",
    });

    return { message: "Venta adicional registrada" };
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
                attributes: ["rut", "nombre", "apellido", "direccion"],
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
      const documentos = entrega.detalleTransaccion.transaccion.documentos || [];
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

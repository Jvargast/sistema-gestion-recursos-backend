import { Op } from "sequelize";
import ClienteRepository from "../../ventas/infrastructure/repositories/ClienteRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import VentasChoferRepository from "../infrastructure/repositories/VentasChoferRepository.js";
import CamionRepository from "../infrastructure/repositories/CamionRepository.js";
import MetodoPagoRepository from "../../ventas/infrastructure/repositories/MetodoPagoRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import AgendaViajesRepository from "../infrastructure/repositories/AgendaViajesRepository.js";
import DetallesVentaChoferRepository from "../infrastructure/repositories/DetallesVentaChoferRepository.js";
import InventarioCamionService from "./InventarioCamionService.js";
import ProductoRetornableRepository from "../../inventario/infrastructure/repositories/ProductoRetornableRepository.js";
import HistorialVentasChoferRepository from "../infrastructure/repositories/HistorialVentasChoferRepository.js";
import PagoRepository from "../../ventas/infrastructure/repositories/PagoRepository.js";
import MovimientoCajaService from "../../ventas/application/MovimientoCajaService.js";
import DocumentoRepository from "../../ventas/infrastructure/repositories/DocumentoRepository.js";
import CajaRepository from "../../ventas/infrastructure/repositories/CajaRepository.js";
import sequelize from "../../database/database.js";

class VentaChoferService {
  async getVentasChofer(filters = {}, options) {
    const allowedFields = [
      "id_cliente",
      "id_camion",
      "fechaHoraVenta",
      "total_venta",
      "estadoPago",
      "id_chofer",
    ];

    const where = createFilter(filters, allowedFields);

    // Incluir búsqueda global si `search` está presente
    if (options.search) {
      where[Op.or] = [
        { "$cliente.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en cliente.nombre
        { "$camion.placa$": { [Op.like]: `%${options.search}%` } }, // Buscar en camion.nombre
        { "$metodoPago.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en metodoPago.nombre
      ];
    }

    // Configurar asociaciones
    const include = [
      {
        model: ClienteRepository.getModel(),
        as: "cliente",
        attributes: ["id_cliente", "rut", "nombre", "email"],
      },
      {
        model: CamionRepository.getModel(),
        as: "camion",
        attributes: ["placa", "estado"],
      },
      {
        model: MetodoPagoRepository.getModel(),
        as: "metodoPago",
        attributes: ["nombre"],
      },
    ];

    // Ejecutar la consulta con paginación
    const result = await paginate(VentasChoferRepository.getModel(), options, {
      where,
      include,
      order: [["fechaHoraVenta", "DESC"]],
    });

    return result;
  }

  async realizarVentaChofer(
    id_chofer,
    id_cliente,
    id_metodo_pago,
    productos,
    retornables_recibidos = [],
    estadoPago = "pendiente",
    monto_recibido
  ) {
    const transaction = await sequelize.transaction();
    try {
      const viajeActivo = await AgendaViajesRepository.findByChoferAndEstado(
        id_chofer,
        "En Tránsito"
      );

      if (!viajeActivo) throw new Error("El chofer no tiene viaje activo.");

      const id_camion = viajeActivo.id_camion;

      for (const item of productos) {
        const productoCamion =
          await InventarioCamionRepository.findByCamionAndProduct(
            id_camion,
            item.id_producto,
            "En Camión - Disponible"
          );

        if (!productoCamion || productoCamion.cantidad < item.cantidad) {
          throw new Error(
            `Producto ID ${item.id_producto} sin stock suficiente.`
          );
        }
      }

      const totalVenta = productos.reduce(
        (acc, p) => acc + p.precioUnitario * p.cantidad,
        0
      );
      if (monto_recibido) {
        if (id_metodo_pago === 1 && monto_recibido < totalVenta) {
          throw new Error("Monto recibido insuficiente.");
        }
      }

      const nuevaVenta = await VentasChoferRepository.create(
        {
          id_camion,
          id_cliente,
          id_chofer,
          id_metodo_pago,
          total_venta: totalVenta,
          tipo_venta: "productos",
          estadoPago,
        },
        { transaction }
      );

      for (const item of productos) {
        await DetallesVentaChoferRepository.create(
          {
            id_venta_chofer: nuevaVenta.id_venta_chofer,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.precioUnitario * item.cantidad,
          },
          { transaction }
        );

        await InventarioCamionService.retirarProductoDelCamion(
          id_camion,
          item.id_producto,
          item.cantidad,
          "En Camión - Disponible",
          transaction
        );
      }

      for (const retornable of retornables_recibidos) {
        await InventarioCamionService.addOrUpdateProductoCamion(
          {
            id_camion,
            id_producto: retornable.id_producto,
            cantidad: retornable.cantidad,
            estado: "En Camión - Retorno",
            tipo: "Retorno",
            es_retornable: true,
          },
          transaction
        );

        // Registrar botellón retornable reutilizable recibido
        await ProductoRetornableRepository.create(
          {
            id_producto: retornable.id_producto,
            id_venta: nuevaVenta.id_venta_chofer,
            cantidad: retornable.cantidad,
            estado: null,
            fecha_retorno: new Date(),
          },
          { transaction }
        );
      }

      const documento = await DocumentoRepository.create(
        {
          id_venta: nuevaVenta.id_venta_chofer,
          tipo_documento: "boleta",
          numero: `B-C-${nuevaVenta.id_venta_chofer}`,
          fecha_emision: new Date(),
          id_cliente: id_cliente ? id_cliente : null,
          id_usuario_creador: id_chofer,
          subtotal: totalVenta,
          monto_neto: totalVenta / 1.19,
          iva: totalVenta - totalVenta / 1.19,
          total: totalVenta,
          id_estado_pago: estadoPago === "pagado" ? 2 : 1,
          estado: "emitido",
          observaciones: "Venta rápida chofer",
          id_venta_chofer: nuevaVenta.id_venta_chofer
        },
        { transaction }
      );
      // Luego registrar el Pago asociado al documento
      const cajaChofer = await CajaRepository.findCajaEstadoByUsuario(
        id_chofer,
        "abierta"
      );
      if (!cajaChofer) {
        throw new Error(`Chofer ${id_chofer} no tiene caja abierta.`);
      }

      await PagoRepository.create(
        {
          id_venta: nuevaVenta.id_venta_chofer,
          id_documento: documento.id_documento,
          id_caja: cajaChofer.id_caja,
          id_metodo_pago,
          id_estado_pago: estadoPago === "pagado" ? 2 : 1,
          monto: totalVenta,
          fecha_pago: new Date(),
          referencia: `Chofer-${id_chofer}-Venta-${nuevaVenta.id_venta_chofer}`,
        },
        { transaction }
      );

      if (id_metodo_pago === 1) {
        const vuelto = monto_recibido - totalVenta;

        await MovimientoCajaService.registrarMovimiento(
          {
            id_caja: cajaChofer.id_caja,
            tipo_movimiento: "ingreso",
            monto: monto_recibido,
            descripcion: `Venta chofer #${nuevaVenta.id_venta_chofer}`,
            id_metodo_pago,
          },
          { transaction }
        );

        if (vuelto > 0) {
          await MovimientoCajaService.registrarMovimiento(
            {
              id_caja: cajaChofer.id_caja,
              tipo_movimiento: "egreso",
              monto: vuelto,
              descripcion: `Vuelto Venta chofer #${nuevaVenta.id_venta_chofer}`,
            },
            { transaction }
          );
        }
      }

      await HistorialVentasChoferRepository.create(
        {
          id_historial_venta_chofer: nuevaVenta.id_venta_chofer,
          id_venta_chofer: nuevaVenta.id_venta_chofer,
          id_agenda_viaje: viajeActivo.id_agenda_viaje,
          fecha_sincronizacion: new Date(),
          estado_sincronizacion: "sincronizado",
        },
        { transaction }
      );
      await transaction.commit();

      return {
        message: "Venta rápida realizada exitosamente.",
        totalVenta,
        vuelto: id_metodo_pago === 1 ? monto_recibido - totalVenta : 0,
        id_venta: nuevaVenta.id_venta_chofer,
      };
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw new Error(`Error al registrar venta del chofer: ${error.message}`);
    }
  }
}

export default new VentaChoferService();

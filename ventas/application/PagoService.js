import SucursalRepository from "../../auth/infraestructure/repositories/SucursalRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import DocumentoRepository from "../infrastructure/repositories/DocumentoRepository.js";
import EstadoPagoRepository from "../infrastructure/repositories/EstadoPagoRepository.js";
import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";
import PagoRepository from "../infrastructure/repositories/PagoRepository.js";
import VentaRepository from "../infrastructure/repositories/VentaRepository.js";

class PagoService {
  async obtenerPagosPorDocumento(id_documento) {
    if (!id_documento)
      throw new Error("El 'id_documento' proporcionado no es válido.");
    return await PagoRepository.findAll({ id_documento });
  }

  async obtenerTodosLosPagos(filters, options) {
    const allowedFields = [
      "id_pago",
      "id_venta",
      "id_documento",
      "id_metodo_pago",
      "id_estado_pago",
      "monto",
      "fecha_pago",
      "referencia",
      "id_sucursal",
    ];
    const where = createFilter(filters, allowedFields);

    if (filters.id_sucursal != null) {
      where.id_sucursal = Number(filters.id_sucursal);
    }

    const include = [
      {
        model: VentaRepository.getModel(),
        as: "venta",
      },
      {
        model: DocumentoRepository.getModel(),
        as: "documento",
      },
      {
        model: EstadoPagoRepository.getModel(),
        as: "estadoPago",
      },
      {
        model: MetodoPagoRepository.getModel(),
        as: "metodoPago",
      },
      {
        model: SucursalRepository.getModel(),
        as: "Sucursal",
        attributes: ["id_sucursal", "nombre"],
        required: false,
      },
    ];

    const result = await paginate(PagoRepository.getModel(), options, {
      where,
      include,
      order: [["fecha_pago", "DESC"]],
      subQuery: false,
    });

    return result;
  }

  async obtenerPagoPorId(id_pago) {
    if (!id_pago) throw new Error("Debe proporcionar un ID de pago.");
    const pago = await PagoRepository.findById(id_pago);
    if (!pago) throw new Error("Pago no encontrado.");
    return pago;
  }

  async getPagosByVentaId(id_venta) {
    return await PagoRepository.findAllByVentaId(id_venta);
  }

  async crearPago(data) {
    if (
      !data ||
      !data.id_venta ||
      !data.id_metodo_pago ||
      !data.monto ||
      !data.fecha_pago
    ) {
      throw new Error("Faltan datos requeridos para crear el pago.");
    }
    return await PagoRepository.create(data);
  }

  async actualizarPago(id_pago, updates) {
    if (!id_pago)
      throw new Error("Debe proporcionar el ID del pago a actualizar.");
    return await PagoRepository.update(id_pago, updates);
  }

  async eliminarPago(id_pago) {
    if (!id_pago)
      throw new Error("Debe proporcionar el ID del pago a eliminar.");
    return await PagoRepository.delete(id_pago);
  }
}

export default new PagoService();

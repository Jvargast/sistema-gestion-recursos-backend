import Documento from "../../domain/models/Documento.js";
import EstadoPago from "../../domain/models/EstadoPago.js";
import MetodoPago from "../../domain/models/MetodoPago.js";
import Pago from "../../domain/models/Pago.js";
import Venta from "../../domain/models/Venta.js";

class PagoRepository {
  async findById(id, options = {}) {
    try {
      return await Pago.findByPk(id, {
        include: [
          { model: Documento, as: "documento" },
          { model: MetodoPago, as: "metodoPago" },
          { model: Venta, as: "venta" },
          { model: EstadoPago, as: "estadoPago" },
        ],
        ...options,
      });
    } catch (error) {
      console.error("Error en PagoRepository.findById:", error.message);
      throw error;
    }
  }
  async findByDocumentoId(id_documento, options = {}) {
    return await Pago.findAll({
      where: { id_documento },
      ...options,
    });
  }

  async findAllByVentaId(id_venta, options = {}) {
    return await Pago.findAll({
      where: { id_venta },
      include: [
        { model: MetodoPago, as: "metodoPago" },
        { model: EstadoPago, as: "estadoPago" },
        { model: Documento, as: "documento" },
      ],
      order: [["fecha_pago", "DESC"]],
      ...options,
    });
  }

  async findAll(filters = {}, options = {}) {
    const limit = options.limit || null;
    const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;

    return await Pago.findAndCountAll({
      where: filters,
      limit,
      offset,
      include: [
        { model: Documento, as: "documento" },
        { model: MetodoPago, as: "metodoPago" },
      ],
    });
  }

  async create(data, options = {}) {
    return await Pago.create(data, options);
  }

  async update(id, updates, options = {}) {
    const [updated] = await Pago.update(updates, {
      where: { id_pago: id },
      ...options,
    });
    return updated > 0 ? await this.findById(id, options) : null;
  }

  async delete(id, options = {}) {
    return await Pago.destroy({ where: { id_pago: id }, ...options });
  }

  getModel() {
    return Pago;
  }
}

export default new PagoRepository();

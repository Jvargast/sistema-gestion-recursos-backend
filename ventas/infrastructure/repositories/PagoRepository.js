import Documento from "../../domain/models/Documento.js";
import EstadoPago from "../../domain/models/EstadoPago.js";
import MetodoPago from "../../domain/models/MetodoPago.js";
import Pago from "../../domain/models/Pago.js";
import Venta from "../../domain/models/Venta.js";

class PagoRepository {
  async findById(id) {
    try {
      return await Pago.findByPk(id, {
        include: [
          { model: Documento, as: "documento" },
          { model: MetodoPago, as: "metodoPago" },
          { model: Venta, as: "venta" },
          { model: EstadoPago, as: "estadoPago"}
        ],
      });
    } catch (error) {
      console.error("Error en PagoRepository.findById:", error.message);
      throw error;
    }
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

  async create(data) {
    return await Pago.create(data);
  }

  async update(id, updates) {
    const [updated] = await Pago.update(updates, {
      where: { id_pago: id },
    });
    return updated > 0 ? await this.findById(id) : null;
  }

  async delete(id) {
    return await Pago.destroy({ where: { id_pago: id } });
  }

  getModel() {
    return Pago;
  }
}

export default new PagoRepository();

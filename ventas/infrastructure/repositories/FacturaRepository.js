import IFacturaRepository from "../../domain/repositories/IFacturaRepository.js";
import Factura from "../../domain/models/Factura.js";

class FacturaRepository extends IFacturaRepository {
  async findById(id) {
    return await Factura.findByPk(id);
  }

  async findAll(filters, options) {
    return await Factura.findAndCountAll({
      where: filters,
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
    });
  }

  async create(data) {
    return await Factura.create(data);
  }

  async update(id, updates) {
    const [updated] = await Factura.update(updates, {
      where: { id_factura: id },
    });
    return updated > 0 ? await this.findById(id) : null;
  }
}

export default new FacturaRepository();

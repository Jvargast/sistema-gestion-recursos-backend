import IFacturaRepository from "../../domain/repositories/IFacturaRepository.js";
import Factura from "../../domain/models/Factura.js";
import EstadoFactura from "../../domain/models/EstadoFactura.js";

class FacturaRepository extends IFacturaRepository {
  async findById(id) {
    try {
      return await Factura.findByPk(id, { include: "estado" });
    } catch (error) {
      console.log("Error en Factura repo", error.message);
    }
    
  }

  async findAll(filters, options) {
    return await Factura.findAndCountAll({
      where: filters,
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
    });
  }

  async findLastFactura(conditions) {
    return await Factura.findOne(conditions);
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

  async findByIds(ids) {
    return await Factura.findAll({
      where: { id_factura: ids },
    });
  }

  getModel() {
    return Factura;
  }
}

export default new FacturaRepository();

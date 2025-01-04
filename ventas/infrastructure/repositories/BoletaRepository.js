import Boleta from "../../domain/models/Boleta.js";
import Documento from "../../domain/models/Documento.js";

class BoletaRepository {
  async findById(id) {
    try {
      return await Boleta.findByPk(id, {
        include: [{ model: Documento, as: "documento" }],
      });
    } catch (error) {
      console.error("Error en BoletaRepository.findById:", error.message);
      throw error;
    }
  }

  async findAll(filters, options) {
    return await Boleta.findAndCountAll({
      where: filters,
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
      include: [{ model: Documento, as: "documento" }],
    });
  }

  async create(data) {
    return await Boleta.create(data, {
      include: [{ model: Documento, as: "documento" }],
    });
  }

  async update(id, updates) {
    const [updated] = await Boleta.update(updates, {
      where: { id_boleta: id },
    });
    return updated > 0 ? await this.findById(id) : null;
  }

  async findByIds(ids) {
    return await Boleta.findAll({
      where: { id_boleta: ids },
      include: [{ model: Documento, as: "documento" }],
    });
  }

  getModel() {
    return Boleta;
  }
}

export default new BoletaRepository();

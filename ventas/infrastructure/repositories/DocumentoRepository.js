import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Cliente from "../../domain/models/Cliente.js";
import Documento from "../../domain/models/Documento.js";
import Venta from "../../domain/models/Venta.js";


class DocumentoRepository {
  async findById(id) {
    try {
      return await Documento.findByPk(id, {
        include: [
          { model: Venta, as: "venta" },
          { model: Cliente, as: "cliente" },
          { model: Usuarios, as: "creador" },
        ],
      });
    } catch (error) {
      console.error("Error en DocumentoRepository.findById:", error.message);
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    const limit = options.limit || null;
    const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;

    return await Documento.findAndCountAll({
      where: filters,
      limit,
      offset,
      include: [
        { model: Venta, as: "venta" },
        { model: Cliente, as: "cliente" },
      ],
    });
  }

  async create(data) {
    return await Documento.create(data);
  }

  async update(id, updates) {
    const [updated] = await Documento.update(updates, {
      where: { id_documento: id },
    });
    return updated > 0 ? await this.findById(id) : null;
  }

  async delete(id) {
    return await Documento.destroy({ where: { id_documento: id } });
  }

  getModel() {
    return Documento;
  }
}

export default new DocumentoRepository();

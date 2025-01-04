import Documento from "../../domain/models/Documento.js";

class DocumentoRepository {
  async findById(id) {
    try {
      return await Documento.findByPk(id);
    } catch (error) {
      console.error("Error en DocumentoRepository.findById:", error.message);
      throw error;
    }
  }
  async findByTransaccionId(id_transaccion) {
    try {
      return await Documento.findAll({
        where: { id_transaccion },
      });
    } catch (error) {
      throw new Error(
        `Error al obtener los documentos para la transacción con ID ${id_transaccion}: ${error.message}`
      );
    }
  }

  async findAll(filters, options) {
    return await Documento.findAndCountAll({
      where: filters,
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
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

  async findByIds(ids) {
    return await Documento.findAll({
      where: { id_documento: ids },
    });
  }

  getModel() {
    return Documento;
  }
}

export default new DocumentoRepository();

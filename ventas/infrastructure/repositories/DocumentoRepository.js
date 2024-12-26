import Documento from "../../domain/models/Documento.js";

class DocumentoRepository {
  // Crear un documento
  async create(data) {
    try {
      const documento = await Documento.create(data);
      return documento;
    } catch (error) {
      throw new Error(`Error al crear el documento: ${error.message}`);
    }
  }

  // Buscar un documento por ID de transacción
  async findByTransaccionId(id_transaccion) {
    try {
      const documento = await Documento.findOne({
        where: { id_transaccion },
      });
      return documento;
    } catch (error) {
      throw new Error(`Error al buscar el documento: ${error.message}`);
    }
  }

  // Actualizar un documento existente
  async update(id_documento, updates) {
    try {
      const documento = await Documento.findByPk(id_documento);
      if (!documento) {
        throw new Error("Documento no encontrado.");
      }
      Object.assign(documento, updates);
      await documento.save();
      return documento;
    } catch (error) {
      throw new Error(`Error al actualizar el documento: ${error.message}`);
    }
  }

  // Eliminar un documento
  async delete(id_documento) {
    try {
      const documento = await Documento.findByPk(id_documento);
      if (!documento) {
        throw new Error("Documento no encontrado.");
      }
      await documento.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar el documento: ${error.message}`);
    }
  }
}

export default new DocumentoRepository();

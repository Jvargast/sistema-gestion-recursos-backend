import InsumoRepository from "../infrastructure/repositories/InsumoRepository.js";
import TipoInsumoRepository from "../infrastructure/repositories/TipoInsumoRepository.js";

class TipoInsumoService {
  normalizarPayload(data = {}) {
    const payload = { ...data };

    if (typeof payload.nombre_tipo === "string") {
      payload.nombre_tipo = payload.nombre_tipo.trim();
    }

    return payload;
  }

  validarNombre(nombre_tipo) {
    if (!nombre_tipo || !String(nombre_tipo).trim()) {
      throw new Error("El nombre del tipo de insumo es obligatorio.");
    }
  }

  async getTipoById(id) {
    const tipo = await TipoInsumoRepository.findById(id);
    if (!tipo) throw new Error("Tipo de insumo no encontrado.");
    return tipo;
  }

  async getAllTipos() {
    return await TipoInsumoRepository.findAll();
  }

  async createTipo(data) {
    const payload = this.normalizarPayload(data);
    this.validarNombre(payload.nombre_tipo);

    const existente = await TipoInsumoRepository.findByNombre(
      payload.nombre_tipo
    );
    if (existente) {
      throw new Error("Ya existe un tipo de insumo con ese nombre.");
    }

    return await TipoInsumoRepository.create(payload);
  }

  async updateTipo(id, data) {
    const tipo = await TipoInsumoRepository.findById(id);
    if (!tipo) throw new Error("Tipo de insumo no encontrado.");

    const payload = this.normalizarPayload(data);

    if (Object.prototype.hasOwnProperty.call(payload, "nombre_tipo")) {
      this.validarNombre(payload.nombre_tipo);

      const duplicado = await TipoInsumoRepository.findByNombreExcludingId(
        payload.nombre_tipo,
        id
      );
      if (duplicado) {
        throw new Error("Ya existe un tipo de insumo con ese nombre.");
      }
    }

    const updated = await TipoInsumoRepository.update(id, payload);
    if (updated[0] === 0)
      throw new Error("No se pudo actualizar el tipo de insumo.");
    return await this.getTipoById(id);
  }

  async deleteTipo(id) {
    const tipo = await TipoInsumoRepository.findById(id);
    if (!tipo) throw new Error("Tipo de insumo no encontrado.");

    const insumosAsociados = await InsumoRepository.countByTipoInsumo(id);
    if (insumosAsociados > 0) {
      throw new Error(
        `No se puede eliminar el tipo de insumo porque tiene ${insumosAsociados} insumo(s) asociado(s).`
      );
    }

    const deleted = await TipoInsumoRepository.delete(id);
    if (deleted === 0) throw new Error("No se pudo eliminar el tipo de insumo.");
    return true;
  }
}

export default new TipoInsumoService();

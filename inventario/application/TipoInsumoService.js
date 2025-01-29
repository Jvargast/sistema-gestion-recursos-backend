import TipoInsumoRepository from '../infrastructure/repositories/TipoInsumoRepository.js';

class TipoInsumoService {
  async getTipoById(id) {
    const tipo = await TipoInsumoRepository.findById(id);
    if (!tipo) throw new Error('Tipo de producto no encontrado.');
    return tipo;
  }

  async getAllTipos() {
    return await TipoInsumoRepository.findAll();
  }

  async createTipo(data) {
    return await TipoInsumoRepository.create(data);
  }

  async updateTipo(id, data) {
    const updated = await TipoInsumoRepository.update(id, data);
    if (updated[0] === 0) throw new Error('No se pudo actualizar el tipo de producto.');
    return await this.getTipoById(id);
  }

  async deleteTipo(id) {
    const deleted = await TipoInsumoRepository.delete(id);
    if (deleted === 0) throw new Error('No se pudo eliminar el tipo de producto.');
    return true;
  }
}

export default new TipoInsumoService();

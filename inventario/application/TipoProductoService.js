import TipoProductoRepository from '../infrastructure/repositories/TipoProductoRepository.js';

class TipoProductoService {
  async getTipoById(id) {
    const tipo = await TipoProductoRepository.findById(id);
    if (!tipo) throw new Error('Tipo de producto no encontrado.');
    return tipo;
  }

  async getAllTipos() {
    return await TipoProductoRepository.findAll();
  }

  async createTipo(data) {
    return await TipoProductoRepository.create(data);
  }

  async updateTipo(id, data) {
    const updated = await TipoProductoRepository.update(id, data);
    if (updated[0] === 0) throw new Error('No se pudo actualizar el tipo de producto.');
    return await this.getTipoById(id);
  }

  async deleteTipo(id) {
    const deleted = await TipoProductoRepository.delete(id);
    if (deleted === 0) throw new Error('No se pudo eliminar el tipo de producto.');
    return true;
  }
}

export default new TipoProductoService();

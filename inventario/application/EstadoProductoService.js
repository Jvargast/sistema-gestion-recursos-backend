import EstadoProductoRepository from '../infrastructure/repositories/EstadoProductoRepository.js';

class EstadoProductoService {
  async getEstadoById(id) {
    const estado = await EstadoProductoRepository.findById(id);
    if (!estado) throw new Error('Estado no encontrado.');
    return estado;
  }

  async getEstadoByNombre(nombre_estado) {
    const estado = await EstadoProductoRepository.findByNombre(nombre_estado);
    if (!estado) throw new Error('Estado no encontrado.');
    return estado;
  }

  async getAllEstados() {
    return await EstadoProductoRepository.findAll();
  }

  async createEstado(data) {
    return await EstadoProductoRepository.create(data);
  }

  async updateEstado(id, data) {
    const updated = await EstadoProductoRepository.update(id, data);
    if (updated[0] === 0) throw new Error('No se pudo actualizar el estado.');
    return await this.getEstadoById(id);
  }

  async deleteEstado(id) {
    const deleted = await EstadoProductoRepository.delete(id);
    if (deleted === 0) throw new Error('No se pudo eliminar el estado.');
    return true;
  }
}

export default new EstadoProductoService();

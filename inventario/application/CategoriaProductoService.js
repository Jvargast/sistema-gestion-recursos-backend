import CategoriaProductoRepository from '../infrastructure/repositories/CategoriaProductoRepository.js';

class CategoriaProductoService {
  async getCategoriaById(id) {
    const categoria = await CategoriaProductoRepository.findById(id);
    if (!categoria) throw new Error('Categoría no encontrada.');
    return categoria;
  }

  async getAllCategorias() {
    return await CategoriaProductoRepository.findAll();
  }

  async createCategoria(data) {
    return await CategoriaProductoRepository.create(data);
  }

  async updateCategoria(id, data) {
    const updated = await CategoriaProductoRepository.update(id, data);
    if (updated[0] === 0) throw new Error('No se pudo actualizar la categoría.');
    return await this.getCategoriaById(id);
  }

  async deleteCategoria(id) {
    const deleted = await CategoriaProductoRepository.delete(id);
    if (deleted === 0) throw new Error('No se pudo eliminar la categoría.');
    return true;
  }
}

export default new CategoriaProductoService();

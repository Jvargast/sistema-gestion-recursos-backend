import ICategoriaProductoRepository from '../../domain/repositories/ICategoriaProductoRepository.js';
import CategoriaProducto from '../../domain/models/CategoriaProducto.js';

class CategoriaProductoRepository extends ICategoriaProductoRepository {
  async findById(id) {
    return await CategoriaProducto.findByPk(id);
  }

  async findAll() {
    return await CategoriaProducto.findAll();
  }

  async create(data) {
    return await CategoriaProducto.create(data);
  }

  async update(id, data) {
    return await CategoriaProducto.update(data, { where: { id_categoria: id } });
  }

  async delete(id) {
    return await CategoriaProducto.destroy({ where: { id_categoria: id } });
  }
}

export default new CategoriaProductoRepository();

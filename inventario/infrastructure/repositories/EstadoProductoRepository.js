import IEstadoProductoRepository from '../../domain/repositories/IEstadoProductoRepository.js';
import EstadoProducto from '../../domain/models/EstadoProducto.js';

class EstadoProductoRepository extends IEstadoProductoRepository {
  async findById(id) {
    return await EstadoProducto.findByPk(id);
  }

  async findAll() {
    return await EstadoProducto.findAll();
  }

  async create(data) {
    return await EstadoProducto.create(data);
  }

  async update(id, data) {
    return await EstadoProducto.update(data, { where: { id_estado_producto: id } });
  }

  async delete(id) {
    return await EstadoProducto.destroy({ where: { id_estado_producto: id } });
  }
}

export default new EstadoProductoRepository();

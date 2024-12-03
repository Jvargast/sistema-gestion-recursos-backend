import ITipoProductoRepository from '../../domain/repositories/ITipoProductoRepository.js';
import TipoProducto from '../../domain/models/TipoProducto.js';

class TipoProductoRepository extends ITipoProductoRepository {
  async findById(id) {
    return await TipoProducto.findByPk(id);
  }

  async findAll() {
    return await TipoProducto.findAll();
  }

  async create(data) {
    return await TipoProducto.create(data);
  }

  async update(id, data) {
    return await TipoProducto.update(data, { where: { id_tipo_producto: id } });
  }

  async delete(id) {
    return await TipoProducto.destroy({ where: { id_tipo_producto: id } });
  }

  getModel() {
    return TipoProducto;
  }
}

export default new TipoProductoRepository();

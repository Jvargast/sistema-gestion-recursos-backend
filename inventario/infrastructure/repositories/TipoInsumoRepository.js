import TipoInsumo from '../../domain/models/TipoInsumo.js';

class TipoInsumoRepository {
  async findById(id_tipo_producto) {
    return await TipoInsumo.findByPk(id_tipo_producto);
  }

  async findAll() {
    return await TipoInsumo.findAll();
  }

  async create(data) {
    return await TipoInsumo.create(data);
  }

  async update(id, data) {
    return await TipoInsumo.update(data, { where: { id_tipo_producto: id } });
  }

  async delete(id) {
    return await TipoInsumo.destroy({ where: { id_tipo_producto: id } });
  }

  getModel() {
    return TipoInsumo;
  }
}

export default new TipoInsumoRepository();

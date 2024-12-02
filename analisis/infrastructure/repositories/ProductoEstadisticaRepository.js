import IProductoEstadisticasRepository from "../../domain/repositories/IProductoEstadisticasRepository.js";
import ProductoEstadisticas from "../../domain/models/ProductoEstadisticas.js";

class ProductoEstadisticasRepository extends IProductoEstadisticasRepository {
  async getAll() {
    return await ProductoEstadisticas.findAll();
  }

  async findByProductoIdAndYear(id_producto, year) {
    return await ProductoEstadisticas.findOne({
      where: { id_producto, year },
    });
  }

  async findByProductoId(id_producto) {
    return await ProductoEstadisticas.findAll({
      where: { id_producto },
    });
  }

  async findById(id) {
    return await ProductoEstadisticas.findByPk(id);
  }

  async updateById(id, data) {
    return await ProductoEstadisticas.update(data, {
      where: { id_producto_estadisticas: id },
    });
  }

  async create(data) {
    return await ProductoEstadisticas.create(data);
  }

  async bulkCreate(dataArray) {
    return await ProductoEstadisticas.bulkCreate(dataArray);
  }

  async updateByProductoIdAndYear(id_producto, year, data) {
    return await ProductoEstadisticas.update(data, {
      where: { id_producto, year },
    });
  }

  async deleteById(id) {
    return await ProductoEstadisticas.destroy({
      where: { id_producto_estadisticas: id },
    });
  }

  async deleteByProductoIdAndYear(id_producto, year) {
    return await ProductoEstadisticas.destroy({
      where: { id_producto, year },
    });
  }

  getModel() {
    return ProductoEstadisticas;
  }
}

export default new ProductoEstadisticasRepository();

import IProductoEstadisticasRepository from "../../domain/repositories/IProductoEstadisticasRepository.js";
import ProductoEstadisticas from "../../domain/models/ProductoEstadisticas.js";

class ProductoEstadisticasRepository extends IProductoEstadisticasRepository {
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

  async create(data) {
    return await ProductoEstadisticas.create(data);
  }

  async updateByProductoIdAndYear(id_producto, year, data) {
    return await ProductoEstadisticas.update(data, {
      where: { id_producto, year },
    });
  }

  async deleteByProductoIdAndYear(id_producto, year) {
    return await ProductoEstadisticas.destroy({
      where: { id_producto, year },
    });
  }
}

export default new ProductoEstadisticasRepository();

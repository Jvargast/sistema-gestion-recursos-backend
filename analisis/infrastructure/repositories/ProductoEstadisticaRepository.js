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

  async findAllByYear(year) {
    try {
      return await ProductoEstadisticas.findAll({
        where: { year },
      });
    } catch (error) {
      console.error("Error al buscar estadísticas por año:", error.message);
      throw error;
    }
  }

  // Método para actualizar o crear en bloque
  async bulkCreate(data, options) {
    try {
      return await ProductoEstadisticas.bulkCreate(data, options);
    } catch (error) {
      console.error("Error al realizar bulkCreate:", error.message);
      throw error;
    }
  }
  // Método para actualizar un registro específico
  async update(id, data) {
    try {
      return await ProductoEstadisticas.update(data, {
        where: { id_producto_estadisticas: id },
      });
    } catch (error) {
      console.error("Error al actualizar estadística:", error.message);
      throw error;
    }
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

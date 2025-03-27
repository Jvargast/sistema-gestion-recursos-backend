import ProductosEstadisticas from "../../domain/models/ProductoEstadisticas.js";

class ProductoEstadisticasRepository {
  async findByProductoYMes(id_producto, mes, anio) {
    return await ProductosEstadisticas.findAll({
      where: { id_producto, mes, anio },
    });
  }

  async create(data) {
    return await ProductosEstadisticas.create(data);
  }

  async deleteByFecha(fecha) {
    return await ProductosEstadisticas.destroy({ where: { fecha } });
  }
}

export default new ProductoEstadisticasRepository();

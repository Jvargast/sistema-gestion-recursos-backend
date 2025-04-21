import { col, fn, Op, where } from "sequelize";
import ProductosEstadisticas from "../../domain/models/ProductoEstadisticas.js";

class ProductoEstadisticasRepository {
  async findByProductoYMes(id_producto, mes, anio) {
    return await ProductosEstadisticas.findAll({
      where: { id_producto, mes, anio },
    });
  }

  async findByFechaYProducto(fecha, id_producto) {
    return await ProductosEstadisticas.findOne({
      where: {
        id_producto,
        [Op.and]: [
          where(fn("DATE", col("fecha")), fecha), // compara solo la fecha
        ],
      },
    });
  }

  async findByFecha(fecha) {
    return await ProductosEstadisticas.findAll({
      where: {
        [Op.and]: [where(fn("DATE", col("fecha")), fecha)],
      },
    });
  }

  async findAllByMesYAnio(mes, anio) {
    return await ProductosEstadisticas.findAll({
      where: {
        mes,
        anio,
      },
      order: [["fecha", "ASC"]],
    });
  }

  async updateById(id, data) {
    return await ProductosEstadisticas.update(data, {
      where: { id },
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

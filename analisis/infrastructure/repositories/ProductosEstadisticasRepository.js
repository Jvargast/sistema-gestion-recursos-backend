import { col, fn, Op, where } from "sequelize";
import ProductosEstadisticas from "../../domain/models/ProductoEstadisticas.js";

class ProductoEstadisticasRepository {
  async findByProductoYMes(id_producto, mes, anio) {
    return await ProductosEstadisticas.findAll({
      where: { id_producto, mes, anio },
    });
  }

  async findByFechaYProducto(fecha, id_producto, { id_sucursal } = {}) {
    return await ProductosEstadisticas.findOne({
      where: {
        id_producto,
        [Op.and]: [where(fn("DATE", col("fecha")), fecha)],
        ...(id_sucursal != null ? { id_sucursal } : {}),
      },
    });
  }

  async findByFechaYInsumo(fecha, idInsumo, { id_sucursal } = {}) {
    return await ProductosEstadisticas.findOne({
      where: {
        fecha,
        id_insumo: idInsumo,
        ...(id_sucursal != null ? { id_sucursal } : {}),
      },
      raw: true,
    });
  }

  async findByFecha(fecha, { id_sucursal } = {}) {
    return await ProductosEstadisticas.findAll({
      where: {
        [Op.and]: [where(fn("DATE", col("fecha")), fecha)],
        ...(id_sucursal != null ? { id_sucursal: Number(id_sucursal) } : {}),
      },
    });
  }

  async findAllByMesYAnio(mes, anio, { id_sucursal } = {}) {
    return await ProductosEstadisticas.findAll({
      where: {
        mes,
        anio,
        ...(id_sucursal != null ? { id_sucursal: Number(id_sucursal) } : {}),
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

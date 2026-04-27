import { col, fn, Op, where } from "sequelize";
import sequelize from "../../../database/database.js";
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
        id_sucursal,
      },
    });
  }

  async findByFechaYInsumo(fecha, idInsumo, { id_sucursal } = {}) {
    return await ProductosEstadisticas.findOne({
      where: {
        fecha,
        id_insumo: idInsumo,
        id_sucursal,
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
    await ProductosEstadisticas.update(data, {
      where: { id },
    });
    return await ProductosEstadisticas.findByPk(id);
  }

  async create(data) {
    return await ProductosEstadisticas.create(data);
  }

  async saveByKey({
    fecha,
    id_producto = null,
    id_insumo = null,
    id_sucursal = null,
    data,
  }) {
    return await sequelize.transaction(async (transaction) => {
      const whereKey = {
        fecha,
        id_producto,
        id_insumo,
        id_sucursal,
      };

      const existentes = await ProductosEstadisticas.findAll({
        where: whereKey,
        order: [["id", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existentes.length === 0) {
        return await ProductosEstadisticas.create(
          { ...whereKey, ...data },
          { transaction }
        );
      }

      const [principal, ...duplicados] = existentes;

      await principal.update(data, { transaction });

      if (duplicados.length > 0) {
        await ProductosEstadisticas.destroy({
          where: { id: duplicados.map((registro) => registro.id) },
          transaction,
        });
      }

      return await principal.reload({ transaction });
    });
  }

  async deleteByFecha(fecha) {
    return await ProductosEstadisticas.destroy({ where: { fecha } });
  }
}

export default new ProductoEstadisticasRepository();

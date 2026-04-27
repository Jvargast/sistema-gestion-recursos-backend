import { col, fn, Op, where } from "sequelize";
import sequelize from "../../../database/database.js";
import VentasEstadisticas from "../../domain/models/VentasEstadisticas.js";

class VentasEstadisticasRepository {
  async findAllByMesYAnio(mes, anio, { id_sucursal } = {}) {
    return await VentasEstadisticas.findAll({
      where: { mes, anio, ...(id_sucursal ? { id_sucursal } : {}) },
    });
  }

  async create(data) {
    return await VentasEstadisticas.create(data);
  }

  async saveByKey(key, data) {
    return await sequelize.transaction(async (transaction) => {
      const existentes = await VentasEstadisticas.findAll({
        where: key,
        order: [["id", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existentes.length === 0) {
        return await VentasEstadisticas.create(
          { ...key, ...data },
          { transaction }
        );
      }

      const [principal, ...duplicados] = existentes;

      await principal.update(data, { transaction });

      if (duplicados.length > 0) {
        await VentasEstadisticas.destroy({
          where: { id: duplicados.map((registro) => registro.id) },
          transaction,
        });
      }

      return await principal.reload({ transaction });
    });
  }

  async deleteByFecha(fecha) {
    return await VentasEstadisticas.destroy({ where: { fecha } });
  }

  async findByFechaYTipo(fecha, tipo_entrega) {
    return await VentasEstadisticas.findOne({
      where: {
        fecha,
        tipo_entrega,
      },
    });
  }

  async updateById(id, data) {
    await VentasEstadisticas.update(data, {
      where: { id },
    });
    return await VentasEstadisticas.findByPk(id);
  }

  async findByFecha(fecha, { id_sucursal } = {}) {
    return await VentasEstadisticas.findAll({
      where: {
        [Op.and]: [where(fn("DATE", col("fecha")), fecha)],
        ...(id_sucursal ? { id_sucursal } : {}),
      },
      raw: true,
    });
  }

  findByKey({ fecha, id_sucursal = null, tipo_entrega = null }) {
    return VentasEstadisticas.findOne({
      where: { fecha, id_sucursal, tipo_entrega },
    });
  }

  getModel() {
    return VentasEstadisticas;
  }
}

export default new VentasEstadisticasRepository();

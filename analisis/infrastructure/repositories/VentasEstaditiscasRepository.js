import { col, fn, Op, where } from "sequelize";
import VentasEstadisticas from "../../domain/models/VentasEstadisticas.js";

class VentasEstadisticasRepository {
  async findAllByMesYAnio(mes, anio) {
    return await VentasEstadisticas.findAll({ where: { mes, anio } });
  }

  async create(data) {
    return await VentasEstadisticas.create(data);
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

  async findByFecha(fecha) {
    return await VentasEstadisticas.findAll({
      where: {
        [Op.and]: [
          where(fn("DATE", col("fecha")), fecha), // ✅ Extrae solo la parte de la fecha
        ],
      },
    });
  }
}

export default new VentasEstadisticasRepository();

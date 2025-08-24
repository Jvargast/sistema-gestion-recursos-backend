import { col, fn, Op, where } from "sequelize";
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

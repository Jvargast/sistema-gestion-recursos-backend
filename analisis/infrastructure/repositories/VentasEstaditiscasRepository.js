import IVentasEstadisticasRepository from "../../domain/repositories/IVentasEstadisticasRepository.js";
import VentasEstadisticas from "../../domain/models/VentasEstadisticas.js";
import { Op } from "sequelize";
import EstadisticasTransacciones from "../../domain/models/EstadisticasTransacciones.js";
import Transaccion from "../../../ventas/domain/models/Transaccion.js";

class VentasEstadisticasRepository extends IVentasEstadisticasRepository {
  async getAll() {
    return await VentasEstadisticas.findAndCountAll();
  }

  async findByYear(year) {
    return await VentasEstadisticas.findAll({
      where: { year },
      include: [
        {
          model: EstadisticasTransacciones,
          as: "estadisticasTransacciones",
          include: [
            {
              model: Transaccion,
              as: "transaccion",
              attributes: ["id_transaccion", "total", "fecha_creacion"],
            },
          ],
        },
      ],
    });
  }
  async getTransaccionesRelacionadas(id_ventas_estadisticas) {
    return await EstadisticasTransacciones.findAll({
      where: { id_ventas_estadisticas: id_ventas_estadisticas },
      include: [
        {
          model: Transaccion,
          as: "transaccion",
        },
      ],
    });
  }

  async findOneByYear(year) {
    return await VentasEstadisticas.findOne({ where: { year } });
  }

  async updateById(id, data) {
    await VentasEstadisticas.update(data, {
      where: { id_ventas_estadisticas: id },
    });
    return await VentasEstadisticas.findByPk(id);
  }

  async findById(id) {
    return await VentasEstadisticas.findByPk(id);
  }

  async findAll() {
    return await VentasEstadisticas.findAll();
  }

  async getAllCount(options = { page: 1, limit: 10 }) {
    const offset = (options.page - 1) * options.limit;
    return await VentasEstadisticas.findAndCountAll({
      limit: options.limit,
      offset,
    });
  }

  async create(data) {
    return await VentasEstadisticas.create(data);
  }

  async updateByYear(year, data) {
    return await VentasEstadisticas.update(data, { where: { year: year } });
  }

  async updateById(id, data) {
    return await VentasEstadisticas.update(data, {
      where: { id_ventas_estadisticas: id },
    });
  }

  async deleteByYear(year) {
    return await VentasEstadisticas.destroy({ where: { year: year } });
  }

  async deleteById(id) {
    return await VentasEstadisticas.destroy({
      where: { id_ventas_estadisticas: id },
    });
  }

  async findWithFilters(filters = {}, options = { page: 1, limit: 10 }) {
    const { year, ventas_anuales_min, ventas_anuales_max } = filters;
    const where = {};

    if (year) where.year = year;
    if (ventas_anuales_min)
      where.ventas_anuales = { [Op.gte]: ventas_anuales_min };
    if (ventas_anuales_max)
      where.ventas_anuales = { [Op.lte]: ventas_anuales_max };

    const offset = (options.page - 1) * options.limit;
    return await VentasEstadisticas.findAndCountAll({
      where,
      limit: options.limit,
      offset,
    });
  }

  getModel() {
    return VentasEstadisticas;
  }
}

export default new VentasEstadisticasRepository();

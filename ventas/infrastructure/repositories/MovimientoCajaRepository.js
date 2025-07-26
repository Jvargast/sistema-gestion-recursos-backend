import { Op } from "sequelize";
import Caja from "../../domain/models/Caja.js";
import MovimientoCaja from "../../domain/models/MovimientoCaja.js";

class MovimientoCajaRepository {
  async findByCajaId(id_caja) {
    return await MovimientoCaja.findAll({
      where: { id_caja },
      include: [{ model: Caja, as: "caja" }],
    });
  }

  async findByCajaIdAndDate(id_caja, fecha, limit, offset) {
    return await MovimientoCaja.findAll({
      where: {
        id_caja,
        fecha_movimiento: {
          [Op.between]: [`${fecha} 00:00:00`, `${fecha} 23:59:59`],
        },
      },
      order: [["fecha_movimiento", "DESC"]],
      limit,
      offset,
    });
  }

  async countByCajaIdAndDate(id_caja, fecha) {
    return await MovimientoCaja.count({
      where: {
        id_caja,
        fecha_movimiento: {
          [Op.between]: [`${fecha} 00:00:00`, `${fecha} 23:59:59`],
        },
      },
    });
  }

  async create(data) {
    return await MovimientoCaja.create(data);
  }

  async update(id, updates) {
    const [updated] = await MovimientoCaja.update(updates, {
      where: { id_movimiento: id },
    });
    return updated > 0 ? await MovimientoCaja.findByPk(id) : null;
  }

  async delete(id) {
    return await MovimientoCaja.destroy({ where: { id_movimiento: id } });
  }

  getModel() {
    return MovimientoCaja;
  }

  async buscarMovimientosPorVenta(id_venta, options = {}) {
    return await MovimientoCaja.findAll({
      where: { id_venta },
      ...options,
    });
  }
}

export default new MovimientoCajaRepository();

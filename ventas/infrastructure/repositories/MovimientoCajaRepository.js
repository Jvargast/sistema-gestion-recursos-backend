import MovimientoCaja from "../../domain/models/MovimientoCaja.js";

class MovimientoCajaRepository {
  async findByCajaId(id_caja) {
    return await MovimientoCaja.findAll({
      where: { id_caja },
      include: [{ model: Caja, as: "caja" }],
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
}

export default new MovimientoCajaRepository();
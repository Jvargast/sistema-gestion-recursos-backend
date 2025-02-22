import HistorialCaja from "../../domain/models/HistorialCaja.js";
import Caja from "../../domain/models/Caja.js";


class HistorialCajaRepository {
  async findById(id) {
    try {
      return await HistorialCaja.findByPk(id, {
        include: [{ model: Caja, as: "caja" }],
      });
    } catch (error) {
      console.error("Error en HistorialCajaRepository.findById:", error.message);
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    const limit = options.limit || null;
    const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;

    return await HistorialCaja.findAndCountAll({
      where: filters,
      limit,
      offset,
      include: [{ model: Caja, as: "caja" }],
    });
  }

  async create(data) {
    return await HistorialCaja.create(data);
  }

  async update(id, data) {
    console.log("Intentando actualizar historial caja con ID:", id);
    console.log("Datos proporcionados para actualizar:", data);

    const [affectedRows] = await HistorialCaja.update(data, {
      where: { id_historial: id },
    });

    if (affectedRows === 0) {
      throw new Error(
        `No se pudo actualizar historial caja con id ${id}. Verifica que exista y que los datos sean correctos.`
      );
    }

    return affectedRows;
  }

  async delete(id) {
    return await HistorialCaja.destroy({ where: { id_historial: id } });
  }

  getModel() {
    return HistorialCaja;
  }
}

export default new HistorialCajaRepository();

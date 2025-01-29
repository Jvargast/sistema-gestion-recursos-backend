import Sucursal from "../../../auth/domain/models/Sucursal.js";
import Caja from "../../domain/models/Caja.js";

class CajaRepository {
  async findById(id) {
    try {
      return await Caja.findByPk(id, {
        include: [{ model: Sucursal, as: "sucursal" }],
      });
    } catch (error) {
      console.error("Error en CajaRepository.findById:", error.message);
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    const limit = options.limit || null;
    const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;

    return await Caja.findAndCountAll({
      where: filters,
      limit,
      offset,
      include: [{ model: Sucursal, as: "sucursal" }],
    });
  }

  async findCajaEstadoByUsuario(rut, estado) {
    return await Caja.findOne({
      where: {
        usuario_apertura: rut,
        estado: estado,
      },
    });
  }

  async findByAsignado(rut) {
    return await Caja.findOne({
      where: { usuario_asignado: rut },
      include: [{ model: Sucursal, as: "sucursal" }],
    });
  }

  async create(data) {
    return await Caja.create(data);
  }

  async update(id, data) {
    console.log("Intentando actualizar caja con ID:", id);
    console.log("Datos proporcionados para actualizar:", data);

    const [affectedRows] = await Caja.update(data, {
      where: { id_caja: id },
    });

    if (affectedRows === 0) {
      throw new Error(
        `No se pudo actualizar la caja con id ${id}. Verifica que exista y que los datos sean correctos.`
      );
    }

    return affectedRows;
  }

  async delete(id) {
    return await Caja.destroy({ where: { id_caja: id } });
  }

  getModel() {
    return Caja;
  }
}

export default new CajaRepository();

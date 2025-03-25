import { Op } from "sequelize";
import Sucursal from "../../../auth/domain/models/Sucursal.js";
import Caja from "../../domain/models/Caja.js";

class CajaRepository {
  async findById(id) {
    return await Caja.findByPk(id, {
      include: [{ model: Sucursal, as: "sucursal" }],
    });
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
        [Op.or]: [
          { usuario_apertura: rut }, // Si el usuario abrió la caja
          { usuario_asignado: rut }, // O si el usuario tiene asignada la caja
        ],
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

  async findCajaEstado(estado) {
    return await Caja.findAll({
      where: {
        estado: estado,
      },
      order: [["fecha_apertura", "DESC"]],
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

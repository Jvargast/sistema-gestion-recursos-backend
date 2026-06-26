import { Op } from "sequelize";
import Sucursal from "../../../auth/domain/models/Sucursal.js";
import Caja from "../../domain/models/Caja.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Roles from "../../../auth/domain/models/Roles.js";

class CajaRepository {
  async findById(id, options = {}) {
    return await Caja.findByPk(id, {
      include: [{ model: Sucursal, as: "sucursal" }],
      ...options,
    });
  }

  async findAll(filters = {}, options = {}) {
    const limit = options.limit || null;
    const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;

    return await Caja.findAndCountAll({
      where: filters,
      limit,
      offset,
      include: [
        { model: Sucursal, as: "sucursal" },
        {
          model: Usuarios,
          as: "usuarioAsignado",
          attributes: ["nombre"],
          include: [{ model: Roles, as: "rol", attributes: ["nombre"] }],
        },
      ],
      order: [["id_caja", "ASC"]],
    });
  }

  async findAbiertasByUsuarioYSucursal(rut, id_sucursal, options = {}) {
    return await Caja.findAll({
      where: {
        estado: "abierta",
        id_sucursal,
        [Op.or]: [{ usuario_apertura: rut }, { usuario_asignado: rut }],
      },
      include: [{ model: Sucursal, as: "sucursal" }],
      order: [["fecha_apertura", "DESC"]],
      ...options,
    });
  }

  async findCajaEstadoByUsuario(rut, estado, options = {}) {
    return await Caja.findOne({
      where: {
        [Op.or]: [{ usuario_apertura: rut }, { usuario_asignado: rut }],
        estado: estado,
      },
      ...options,
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

  async findAllByAsignado(rut) {
    return await Caja.findAll({
      where: { usuario_asignado: rut },
      include: [{ model: Sucursal, as: "sucursal" }],
      order: [["fecha_apertura", "DESC"]],
    });
  }

  async findCajasAbiertasByUsuario(rut) {
    return await Caja.findAll({
      where: {
        estado: "abierta",
        [Op.or]: [{ usuario_apertura: rut }, { usuario_asignado: rut }],
      },
      order: [["fecha_apertura", "DESC"]],
    });
  }

  async create(data, options = {}) {
    return await Caja.create(data, options);
  }

  async update(id, data, options = {}) {
    console.log("Intentando actualizar caja con ID:", id);
    console.log("Datos proporcionados para actualizar:", data);

    const [affectedRows] = await Caja.update(data, {
      where: { id_caja: id },
      ...options,
    });

    if (affectedRows === 0) {
      throw new Error(
        `No se pudo actualizar la caja con id ${id}. Verifica que exista y que los datos sean correctos.`
      );
    }

    return affectedRows;
  }

  async delete(id, options = {}) {
    return await Caja.destroy({ where: { id_caja: id }, ...options });
  }

  getModel() {
    return Caja;
  }
}

export default new CajaRepository();

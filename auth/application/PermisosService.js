import { Op } from "sequelize";
import PermisosRepository from "../../auth/infraestructure/repositories/PermisosRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";

class PermisosService {
  async createPermiso(data) {
    const { nombre } = data;

    // Verificar si ya existe un permiso con el mismo nombre
    const permisoExistente = await PermisosRepository.findAll();
    const existe = permisoExistente.some(
      (permiso) => permiso.nombre === nombre
    );

    if (existe) {
      throw new Error("Ya existe un permiso con este nombre");
    }

    return await PermisosRepository.create(data);
  }

  async updatePermiso(id, data) {
    const permiso = await PermisosRepository.findById(id);
    if (!permiso) {
      throw new Error("Permiso no encontrado");
    }

    return await PermisosRepository.update(id, data);
  }

  async deletePermiso(id) {
    const permiso = await PermisosRepository.findById(id);
    if (!permiso) {
      throw new Error("Permiso no encontrado");
    }

    return await PermisosRepository.delete(id);
  }

  async findAllPermisos(filters = {}, options) {
    const allowedFields = ["id"];
    const where = createFilter(filters, allowedFields);
    if (options.search) {
      where[Op.or] = [{ nombre: { [Op.like]: `%${options.search}%` } }];
    }
    const include = [
      {
        model: PermisosRepository.getModel(),
        as: "Dependencias",
        through: {
          attributes: [],
        },
        attributes: ["id", "nombre", "categoria"],
      },
    ];
    const result = await paginate(PermisosRepository.getModel(), options, {
      where,
      include,
      order: [["id", "ASC"]],
    });
    return result;
  }

  async getPermisoById(id) {
    const permiso = await PermisosRepository.findById(id);
    if (!permiso) {
      throw new Error("Permiso no encontrado");
    }

    return permiso;
  }
}

export default new PermisosService();

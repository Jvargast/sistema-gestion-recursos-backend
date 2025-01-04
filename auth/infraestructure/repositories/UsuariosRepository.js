import Empresa from "../../domain/models/Empresa.js";
import Permisos from "../../domain/models/Permisos.js";
import Roles from "../../domain/models/Roles.js";
import RolesPermisos from "../../domain/models/RolesPermisos.js";
import Sucursal from "../../domain/models/Sucursal.js";
import Usuario from "../../domain/models/Usuarios.js";
import IUsuariosRepository from "../../domain/repositories/IUsuariosRepository.js";

class UsuarioRepository extends IUsuariosRepository {
  async findByRut(rut) {
    return await Usuario.findOne({
      where: { rut, activo: true },
      /* attributes: { exclude: ["password"] }, */
      include: [
        { model: Roles, as: "rol", attributes: ["id", "nombre"] },
        { model: Empresa, as: "Empresa", attributes: ["id_empresa", "nombre"] },
        {
          model: Sucursal,
          as: "Sucursal",
          attributes: ["id_sucursal", "nombre"],
        },
      ],
    });
  }

  async create(data) {
    return await Usuario.create({
      ...data,
      activo: true,
    });
  }

  async update(rut, data) {
    return await Usuario.update(data, { where: { rut } });
  }

  async deactivate(rut) {
    return await Usuario.update({ activo: false }, { where: { rut } });
  }

  async findAll() {
    return await Usuario.findAll();
  }

  async findAllByRolId(rolId) {
    return await Usuario.findAll({
      where: { rolId },
      attributes: ["rut", "nombre", "apellido", "email", "rolId"],
      include: {
        model: Roles,
        as: "rol",
        attributes: ["nombre"],
      },
    });
  }

  async findOne(rut) {
    return await Usuario.findOne({
      where: { rut },
      attributes: ["rut", "nombre", "apellido", "email", "rolId"],
      include: {
        model: Roles,
        as: "rol",
        attributes: ["nombre"],
        include: [
          {
            model: RolesPermisos,
            as: "rolesPermisos", // Usa el alias definido en la relación
            include: [
              {
                model: Permisos,
                as: "permiso", // Usa el alias definido en la relación
                attributes: ["nombre"], // Solo queremos el nombre del permiso
              },
            ],
          },
        ],
      },
    });
  }

  async updateLastLogin(rut, fecha) {
    return await Usuario.update({ ultimo_login: fecha }, { where: { rut } });
  }

  getModel() {
    return Usuario;
  }
}

export default new UsuarioRepository();

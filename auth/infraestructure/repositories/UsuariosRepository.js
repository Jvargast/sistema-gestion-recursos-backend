import Usuario from "../../domain/models/Usuarios.js";
import IUsuariosRepository from "../../domain/repositories/IUsuariosRepository.js";

class UsuarioRepository extends IUsuariosRepository {
  async findByRut(rut) {
    return await Usuario.findOne({
      where: { rut, activo: true },
      /* include: {
        model: Roles,
        as: "rol",
        include: {
          model: RolesPermisos,
          as: "rolesPermisos",
          include: {
            model: Permisos,
            as: "permiso",
          },
        },
      }, */
    });
  }

  async create(data) {
    return await Usuario.create({
      ...data,
      activo: true, // Por defecto, los usuarios son activos
    });
    /* const { rut, nombre, apellido, email, password, rolId, ...rest } = data;

    const rol = await Roles.findByPk(rolId);
    if (!rol) {
      throw new Error("Rol no encontrado");
    } */

    // Crear el usuario con el rol asociado
    /* return await Usuario.create({
      rut,
      nombre,
      apellido,
      email,
      password,
      rolId,
      ...rest,
      activo: true, // Asegurarse de que el usuario sea activo por defecto
    }); */
  }

  async update(rut, data) {
    return await Usuario.update(data, { where: { rut } });
  }

  async deactivate(rut) {
    // Marca el usuario como inactivo
    return await Usuario.update({ activo: false }, { where: { rut } });
  }

  async findAll() {
    return await Usuario.findAll(/* {
      include: {
        model: Roles,
        as: "rol",
        include: {
          model: RolesPermisos,
          as: "rolesPermisos",
          include: {
            model: Permisos,
            as: "permiso",
          },
        },
      },
    } */);
  }
}

export default new UsuarioRepository();

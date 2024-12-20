import RolRepository from "../infraestructure/repositories/RolRepository.js";
import validatePermissionsExist from "./helpers/ValidatePermissions.js";

class RolesService {
  /**
   * Crear un nuevo rol con permisos asociados.
   * @param {Object} data - Datos del rol y sus permisos.
   * @returns {Promise<Object>} - Retorna el rol creado.
   */
  async createRol(data) {
    const { nombre, descripcion, permisos = [] } = data;

    // Validar que los permisos existen
    await validatePermissionsExist(permisos);

    // Crear el rol
    const rol = await RolRepository.create({ nombre, descripcion });

    // Asignar permisos al rol
    if (permisos.length > 0) {
        await RolRepository.addPermisos(rol.id, permisos);
      }

    return rol;
  }
  /**
   * Actualizar un rol y sus permisos.
   * @param {number} id - ID del rol.
   * @param {Object} data - Datos del rol y sus permisos.
   * @returns {Promise<Object>} - Retorna el rol actualizado.
   */
  async updateRol(id, data) {
    const { nombre, descripcion, permisos = [] } = data;

    // Validar que el rol exista
    const rol = await RolRepository.findById(id);
    if (!rol) {
      throw new Error("El rol especificado no existe");
    }

    // Validar que los permisos existen
    await validatePermissionsExist(permisos);

    await RolRepository.update(id, { nombre, descripcion });

    // Obtener los permisos actualmente asociados al rol
    const permisosActuales = rol.rolesPermisos.map((rp) => rp.permisoId);

    // Identificar permisos a agregar y a eliminar
    const permisosAgregar = permisos.filter(
      (permiso) => !permisosActuales.includes(permiso)
    );
    const permisosEliminar = permisosActuales.filter(
      (permiso) => !permisos.includes(permiso)
    );

    // Actualizar asociaciones de permisos
    if (permisosAgregar.length > 0) {
      await RolRepository.addPermisos(id, permisosAgregar);
    }
    if (permisosEliminar.length > 0) {
      await RolRepository.removePermisos(id, permisosEliminar);
    }

    /*         // Actualizar el rol
        await RolRepository.update(id, { nombre, descripcion });

        // Actualizar permisos asociados
        await RolRepository.updatePermisos(id, permisos); */

    return await RolRepository.findById(id); // Retornar el rol actualizado con permisos
  }

  /**
   * Obtener un rol por su ID con sus permisos.
   * @param {number} id - ID del rol.
   * @returns {Promise<Object>} - Retorna el rol con sus permisos.
   */
  async getRolById(id) {
    const rol = await RolRepository.findById(id);

    if (!rol) {
      throw new Error("El rol especificado no existe");
    }

    return rol;
  }

  /**
   * Obtener todos los roles con sus permisos.
   * @returns {Promise<Array>} - Retorna la lista de roles con sus permisos.
   */
  async getAllRoles() {
    return await RolRepository.findAll();
  }

  async getRolIdByName(nombreRol) {
    try {
      const rol = await RolRepository.findByIdConditions({
        where: { nombre: nombreRol }, // Filtra por nombre del rol
        attributes: ['id'], // Solo trae el campo 'id'
      });

      if (!rol) {
        throw new Error(`No se encontró un rol con el nombre: ${nombreRol}`);
      }

      return rol.id; // Retorna el ID del rol
    } catch (error) {
      throw new Error(`Error al obtener el ID del rol: ${error.message}`);
    }
  }

  /**
   * Eliminar un rol por su ID (sin eliminar permisos).
   * @param {number} id - ID del rol.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async deleteRol(id) {
    return await RolRepository.delete(id);
  }
}
export default new RolesService();

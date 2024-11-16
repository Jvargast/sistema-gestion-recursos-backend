import IRolRepository from "../../domain/repositories/IRolRepository.js";
import Roles from "../../domain/models/Roles.js";
import RolesPermisos from "../../domain/models/RolesPermisos.js";
import Permisos from "../../domain/models/Permisos.js";

class RolRepository extends IRolRepository {
  /**
   * Encuentra un rol por su ID.
   * @param {number} id - ID del rol.
   * @returns {Promise<Object|null>} - Retorna el rol encontrado o null si no existe.
   */
  async findById(id) {
    return await Roles.findByPk(id, {
      include: {
        model: RolesPermisos,
        as: "rolesPermisos",
        include: { model: Permisos, as: "permiso" },
      },
    });
  }

  /**
   * Crea un nuevo rol.
   * @param {Object} data - Datos del rol.
   * @returns {Promise<Object>} - Retorna el rol creado.
   */
  async create(data) {
    return await Roles.create(data);
    /* const { nombre, descripcion, permisos = [] } = data;

        // Verificar si todos los permisos existen
        const permisosExistentes = await Permisos.findAll({
          where: { id: permisos },
        });
    
        if (permisosExistentes.length !== permisos.length) {
          throw new Error('Uno o más permisos no existen');
        }
    
        // Crear el rol
        const rol = await Roles.create({ nombre, descripcion });
    
        // Asociar los permisos al rol
        const relaciones = permisos.map((permisoId) => ({
          rolId: rol.id,
          permisoId,
        }));
        await RolesPermisos.bulkCreate(relaciones);
    
        return rol; */
  }

  /**
   * Actualizar los permisos asociados a un rol.
   * @param {number} rolId - ID del rol.
   * @param {Array<number>} permisos - IDs de los permisos a asociar.
   * @returns {Promise<void>}
   */
  async updatePermisos(rolId, permisos) {
    // Eliminar asociaciones existentes
    await RolesPermisos.destroy({ where: { rolId } });

    // Crear nuevas asociaciones
    const nuevasAsociaciones = permisos.map((permisoId) => ({
      rolId,
      permisoId,
    }));
    await RolesPermisos.bulkCreate(nuevasAsociaciones);
  }

  /**
   * Actualiza un rol existente.
   * @param {number} id - ID del rol.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async update(id, data) {
    return await Roles.update(data, { where: { id } });
  }

  /**
   * Elimina un rol por su ID.
   * @param {number} id - ID del rol.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async delete(id) {
    return await Roles.destroy({ where: { id } });
  }

  /**
   * Encuentra todos los roles.
   * @returns {Promise<Array>} - Retorna una lista de roles.
   */
  async findAll() {
    return await Roles.findAll({
      include: {
        model: RolesPermisos,
        as: "rolesPermisos",
        include: { model: Permisos, as: "permiso" },
      },
    });
  }

  /**
   * Agregar permisos a un rol.
   * @param {number} rolId - ID del rol.
   * @param {Array<number>} permisos - IDs de los permisos a agregar.
   * @returns {Promise<void>}
   */
  async addPermisos(rolId, permisos) {
    const nuevasAsociaciones = permisos.map((permisoId) => ({
      rolId,
      permisoId,
    }));
    await RolesPermisos.bulkCreate(nuevasAsociaciones);
  }

  /**
   * Eliminar permisos de un rol.
   * @param {number} rolId - ID del rol.
   * @param {Array<number>} permisos - IDs de los permisos a eliminar.
   * @returns {Promise<void>}
   */
  async removePermisos(rolId, permisos) {
    await RolesPermisos.destroy({
      where: {
        rolId,
        permisoId: permisos,
      },
    });
  }
}

export default new RolRepository();

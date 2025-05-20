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
        include: [
          {
            model: Permisos,
            as: "permiso",
            include: [
              {
                model: Permisos,
                as: "Dependencias",
                through: { attributes: [] },
              },
              {
                model: Permisos,
                as: "RequierenEste",
                through: { attributes: [] },
              },
            ],
          },
        ],
      },
    });
  }

  async findByName(nombre) {
    return await Roles.findOne({ where: { nombre } });
  }

  async findByIdConditions(conditions) {
    return await Roles.findOne(conditions);
  }

  /**
   * Crea un nuevo rol.
   * @param {Object} data - Datos del rol.
   * @returns {Promise<Object>} - Retorna el rol creado.
   */
  async create(data) {
    return await Roles.create(data);
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

  async getRoleWithPermissions(rolId) {
    return await Roles.findByPk(rolId, {
      include: [
        {
          model: RolesPermisos,
          as: "rolesPermisos", // Alias usado en la relación
          include: [
            {
              model: Permisos,
              as: "permiso", // Alias usado en la relación
              attributes: ["nombre"], // Solo queremos los nombres de los permisos
            },
          ],
        },
      ],
    });
  }

  getModel() {
    return Roles;
  }
}

export default new RolRepository();

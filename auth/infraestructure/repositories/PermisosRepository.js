import IPermisoRepository from "../../domain/repositories/IPermisosRepository.js";
import Permisos from "../../domain/models/Permisos.js";

class PermisosRepository extends IPermisoRepository {
  /**
   * Encuentra un permiso por su ID.
   * @param {number} id - ID del permiso.
   * @returns {Promise<Object|null>} - Retorna el permiso encontrado o null si no existe.
   */
  async findById(id) {
    return await Permisos.findByPk(id);
  }

  /**
   * Encuentra todos los permisos.
   * @returns {Promise<Array>} - Retorna una lista de permisos.
   */
  async findAll() {
    return await Permisos.findAll();
  }

  /**
   * Crea un nuevo permiso.
   * @param {Object} data - Datos del permiso.
   * @returns {Promise<Object>} - Retorna el permiso creado.
   */
  async create(data) {
    return await Permisos.create(data);
  }

  /**
   * Actualiza un permiso existente.
   * @param {number} id - ID del permiso.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async update(id, data) {
    return await Permisos.update(data, { where: { id } });
  }

  /**
   * Elimina un permiso por su ID.
   * @param {number} id - ID del permiso.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async delete(id) {
    return await Permisos.destroy({ where: { id } });
  }

  getModel() {
    return Permisos;
  }
}

export default new PermisosRepository();

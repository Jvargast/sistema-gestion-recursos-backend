import PermisosDependencias from "../../domain/models/PermisosDependencias.js";

class PermisosDependenciasRepository {
  /**
   * Encuentra un permiso por su ID.
   * @param {number} id - ID del permiso.
   * @returns {Promise<Object|null>} - Retorna el permiso encontrado o null si no existe.
   */
  async findById(id) {
    return await PermisosDependencias.findByPk(id);
  }

  /**
   * Encuentra todos los permisos.
   * @returns {Promise<Array>} - Retorna una lista de permisos.
   */
  async findAll() {
    return await PermisosDependencias.findAll();
  }

  /**
   * Crea un nuevo permiso.
   * @param {Object} data - Datos del permiso.
   * @returns {Promise<Object>} - Retorna el permiso creado.
   */
  async create(data) {
    return await PermisosDependencias.create(data);
  }

  /**
   * Actualiza un permiso existente.
   * @param {number} id - ID del permiso.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async update(id, data) {
    return await PermisosDependencias.update(data, { where: { id } });
  }

  /**
   * Elimina un permiso por su ID.
   * @param {number} id - ID del permiso.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async delete(id) {
    return await PermisosDependencias.destroy({ where: { id } });
  }

  getModel() {
    return PermisosDependencias;
  }
}

export default new PermisosDependenciasRepository();

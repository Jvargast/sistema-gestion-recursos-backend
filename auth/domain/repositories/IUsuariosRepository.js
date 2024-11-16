class IUsuariosRepository {
  /**
   * Encuentra un usuario por su RUT.
   * @param {string} rut - El RUT del usuario.
   * @returns {Promise<Object|null>} - Retorna el usuario encontrado o null si no existe.
   */
  async findByRut(rut) {
    throw new Error('Method not implemented');
  }

  /**
   * Crea un nuevo usuario.
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<Object>} - Retorna el usuario creado.
   */
  async create(data) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza un usuario existente.
   * @param {string} rut - El RUT del usuario.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async update(rut, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Desactiva un usuario por su RUT.
   * @param {string} rut - El RUT del usuario.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async deactivate(rut) {
    throw new Error('Method not implemented');
  }

  /**
   * Encuentra todos los usuarios activos.
   * @returns {Promise<Array>} - Retorna una lista de usuarios activos.
   */
  async findAll() {
    throw new Error('Method not implemented');
  }
}

export default IUsuariosRepository;
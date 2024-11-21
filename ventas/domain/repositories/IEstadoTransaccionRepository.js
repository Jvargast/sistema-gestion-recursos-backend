class IEstadoTransaccionRepository {
  /**
   * Encuentra un estado de transacción por su ID.
   * @param {number} id - ID del estado de transacción.
   * @returns {Promise<Object|null>} - Estado encontrado o null.
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Encuentra todos los estados de transacción.
   * @returns {Promise<Array>} - Lista de estados de transacción.
   */
  async findAll() {
    throw new Error("Method not implemented");
  }

  /**
   * Encuentra un estado de transacción por su nombre.
   * @param {string} nombre - nombre del estado de transacción.
   * @returns {Promise<Object|null>} - Estado encontrado o null.
   */
  async findByNombre(nombre) {
    throw new Error("Method not implemented");
  }

  /**
   * Crea un nuevo estado de transacción.
   * @param {Object} data - Datos del estado.
   * @returns {Promise<Object>} - Estado creado.
   */
  async create(data) {
    throw new Error("Method not implemented");
  }

  /**
   * Actualiza un estado de transacción existente.
   * @param {number} id - ID del estado.
   * @param {Object} data - Datos actualizados.
   * @returns {Promise<number>} - Número de filas afectadas.
   */
  async update(id, data) {
    throw new Error("Method not implemented");
  }

  /**
   * Elimina un estado de transacción.
   * @param {number} id - ID del estado.
   * @returns {Promise<number>} - Número de filas afectadas.
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }
}

export default IEstadoTransaccionRepository;

class IFacturaRepository {
  /**
   * Encuentra una transacción por su ID.
   * @param {number} id - ID de la transacción.
   * @returns {Promise<Object|null>} - Transacción encontrada o null.
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Encuentra todas las transacciones.
   * @returns {Promise<Array>} - Lista de transacciones.
   */
  async findAll() {
    throw new Error("Method not implemented");
  }

  /**
   * Crea una nueva transacción.
   * @param {Object} data - Datos de la transacción.
   * @returns {Promise<Object>} - Transacción creada.
   */
  async create(data) {
    throw new Error("Method not implemented");
  }

  /**
   * Actualiza una transacción.
   * @param {number} id - ID de la transacción.
   * @param {Object} data - Datos actualizados.
   * @returns {Promise<number>} - Número de filas afectadas.
   */
  async update(id, data) {
    throw new Error("Method not implemented");
  }
}

export default IFacturaRepository;

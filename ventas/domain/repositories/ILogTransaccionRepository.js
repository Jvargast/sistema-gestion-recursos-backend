class ILogTransaccionRepository {
  /**
   * Encuentra todos los logs de una transacción.
   * @param {number} transaccionId - ID de la transacción.
   * @returns {Promise<Array>} - Lista de logs.
   */
  async findByTransaccionId(transaccionId) {
    throw new Error("Method not implemented");
  }

  /**
   * Crea un log para una transacción.
   * @param {Object} data - Datos del log.
   * @returns {Promise<Object>} - Log creado.
   */
  async create(data) {
    throw new Error("Method not implemented");
  }

  /**
   * Crea múltiples logs para varias transacciones.
   * @param {Array<Object>} logs - Lista de datos de los logs.
   * @returns {Promise<Array>} - Logs creados.
   */
  async bulkCreate(logs) {
    throw new Error("Method not implemented");
  }

  /**
   * Encuentra todos los logs registrados en el sistema.
   * @returns {Promise<Array>} - Lista completa de logs.
   */
  async findAll() {
    throw new Error("Method not implemented");
  }
}

export default ILogTransaccionRepository;

class IPagoRepository {
    /**
     * Encuentra un pago por su ID.
     * @param {number} id - ID del pago.
     * @returns {Promise<Object|null>} - Pago encontrado o null.
     */
    async findById(id) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Encuentra todos los pagos asociados a una transacción.
     * @param {number} transaccionId - ID de la transacción.
     * @returns {Promise<Array>} - Lista de pagos.
     */
    async findByTransaccionId(transaccionId) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Crea un pago.
     * @param {Object} data - Datos del pago.
     * @returns {Promise<Object>} - Pago creado.
     */
    async create(data) {
      throw new Error("Method not implemented");
    }
  }
  
  export default IPagoRepository;
  
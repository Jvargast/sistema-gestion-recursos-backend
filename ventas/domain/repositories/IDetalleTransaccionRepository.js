class IDetalleTransaccionRepository {
    /**
     * Encuentra los detalles de una transacción.
     * @param {number} transaccionId - ID de la transacción.
     * @returns {Promise<Array>} - Lista de detalles.
     */
    async findByTransaccionId(transaccionId) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Crea un detalle de transacción.
     * @param {Object} data - Datos del detalle.
     * @returns {Promise<Object>} - Detalle creado.
     */
    async create(data) {
      throw new Error("Method not implemented");
    }
  }
  
  export default IDetalleTransaccionRepository;
  
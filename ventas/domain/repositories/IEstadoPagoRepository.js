class IEstadoPagoRepository {
    /**
     * Encuentra un estado de pago por su ID.
     * @param {number} id - ID del estado de pago.
     * @returns {Promise<Object|null>} - Estado encontrado o null.
     */
    async findById(id) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Encuentra todos los estados de pago.
     * @returns {Promise<Array>} - Lista de estados.
     */
    async findAll() {
      throw new Error("Method not implemented");
    }
  }
  
  export default IEstadoPagoRepository;
  
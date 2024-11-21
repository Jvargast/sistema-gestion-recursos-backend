class IMetodoPagoRepository {
    /**
     * Encuentra un método de pago por su ID.
     * @param {number} id - ID del método de pago.
     * @returns {Promise<Object|null>} - Método encontrado o null.
     */
    async findById(id) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Encuentra todos los métodos de pago.
     * @returns {Promise<Array>} - Lista de métodos de pago.
     */
    async findAll() {
      throw new Error("Method not implemented");
    }
  }
  
  export default IMetodoPagoRepository;
  
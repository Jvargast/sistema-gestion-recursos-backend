class IEstadoProductoRepository {
    /**
     * Encuentra un estado por su ID.
     * @param {number} id - ID del estado.
     * @returns {Promise<Object|null>} - Retorna el estado encontrado o null si no existe.
     */
    async findById(id) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Encuentra todos los estados.
     * @returns {Promise<Array>} - Retorna una lista de estados.
     */
    async findAll() {
      throw new Error('Method not implemented');
    }
  
    /**
     * Crea un nuevo estado.
     * @param {Object} data - Datos del estado.
     * @returns {Promise<Object>} - Retorna el estado creado.
     */
    async create(data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Actualiza un estado existente.
     * @param {number} id - ID del estado.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async update(id, data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Elimina un estado por su ID.
     * @param {number} id - ID del estado.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async delete(id) {
      throw new Error('Method not implemented');
    }
  }
  
  export default IEstadoProductoRepository;
  
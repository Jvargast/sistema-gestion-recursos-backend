class ITipoProductoRepository {
    /**
     * Encuentra un tipo de producto por su ID.
     * @param {number} id - ID del tipo de producto.
     * @returns {Promise<Object|null>} - Retorna el tipo de producto encontrado o null si no existe.
     */
    async findById(id) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Encuentra todos los tipos de productos.
     * @returns {Promise<Array>} - Retorna una lista de tipos de productos.
     */
    async findAll() {
      throw new Error('Method not implemented');
    }
  
    /**
     * Crea un nuevo tipo de producto.
     * @param {Object} data - Datos del tipo de producto.
     * @returns {Promise<Object>} - Retorna el tipo de producto creado.
     */
    async create(data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Actualiza un tipo de producto existente.
     * @param {number} id - ID del tipo de producto.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async update(id, data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Elimina un tipo de producto por su ID.
     * @param {number} id - ID del tipo de producto.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async delete(id) {
      throw new Error('Method not implemented');
    }
  }
  
  export default ITipoProductoRepository;
  
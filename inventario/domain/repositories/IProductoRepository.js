class IProductoRepository {
    /**
     * Encuentra un producto por su ID.
     * @param {number} id - ID del producto.
     * @returns {Promise<Object|null>} - Retorna el producto encontrado o null si no existe.
     */
    async findById(id) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Encuentra todos los productos.
     * @returns {Promise<Array>} - Retorna una lista de productos.
     */
    async findAll() {
      throw new Error('Method not implemented');
    }
  
    /**
     * Crea un nuevo producto.
     * @param {Object} data - Datos del producto.
     * @returns {Promise<Object>} - Retorna el producto creado.
     */
    async create(data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Actualiza un producto existente.
     * @param {number} id - ID del producto.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async update(id, data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Elimina un producto por su ID.
     * @param {number} id - ID del producto.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async delete(id) {
      throw new Error('Method not implemented');
    }
  }
  
  export default IProductoRepository;
  
class ICategoriaProductoRepository {
    /**
     * Encuentra una categoría por su ID.
     * @param {number} id - ID de la categoría.
     * @returns {Promise<Object|null>} - Retorna la categoría encontrada o null si no existe.
     */
    async findById(id) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Encuentra todas las categorías.
     * @returns {Promise<Array>} - Retorna una lista de categorías.
     */
    async findAll() {
      throw new Error('Method not implemented');
    }
  
    /**
     * Crea una nueva categoría.
     * @param {Object} data - Datos de la categoría.
     * @returns {Promise<Object>} - Retorna la categoría creada.
     */
    async create(data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Actualiza una categoría existente.
     * @param {number} id - ID de la categoría.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async update(id, data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Elimina una categoría por su ID.
     * @param {number} id - ID de la categoría.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async delete(id) {
      throw new Error('Method not implemented');
    }
  }
  
  export default ICategoriaProductoRepository;
  
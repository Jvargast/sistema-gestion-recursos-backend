class IRolRepository {
    /**
     * Encuentra un rol por su ID.
     * @param {number} id - ID del rol.
     * @returns {Promise<Object|null>} - Retorna el rol encontrado o null si no existe.
     */
    async findById(id) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Crea un nuevo rol.
     * @param {Object} data - Datos del rol.
     * @returns {Promise<Object>} - Retorna el rol creado.
     */
    async create(data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Actualiza un rol existente.
     * @param {number} id - ID del rol.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async update(id, data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Elimina un rol por su ID.
     * @param {number} id - ID del rol.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async delete(id) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Encuentra todos los roles.
     * @returns {Promise<Array>} - Retorna una lista de roles.
     */
    async findAll() {
      throw new Error('Method not implemented');
    }
  }
  
  export default IRolRepository;
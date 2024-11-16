class IPermisoRepository {
    /**
     * Encuentra un permiso por su ID.
     * @param {number} id - ID del permiso.
     * @returns {Promise<Object|null>} - Retorna el permiso encontrado o null si no existe.
     */
    async findById(id) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Encuentra todos los permisos.
     * @returns {Promise<Array>} - Retorna una lista de permisos.
     */
    async findAll() {
      throw new Error('Method not implemented');
    }
  
    /**
     * Crea un nuevo permiso.
     * @param {Object} data - Datos del permiso.
     * @returns {Promise<Object>} - Retorna el permiso creado.
     */
    async create(data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Actualiza un permiso existente.
     * @param {number} id - ID del permiso.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async update(id, data) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Elimina un permiso por su ID.
     * @param {number} id - ID del permiso.
     * @returns {Promise<number>} - Retorna el número de filas afectadas.
     */
    async delete(id) {
      throw new Error('Method not implemented');
    }
  }
  
  export default IPermisoRepository;
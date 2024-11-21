class IClienteRepository {
  /**
   * Encuentra un cliente por su ID.
   * @param {number} id - ID del cliente.
   * @returns {Promise<Object|null>} - Cliente encontrado o null.
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Encuentra todos los clientes.
   * @returns {Promise<Array>} - Lista de clientes.
   */
  async findAll() {
    throw new Error("Method not implemented");
  }

  /**
   * Encuentra clientes utilizando un filtro dinámico.
   * @param {Object} where - Condiciones de búsqueda.
   * @returns {Promise<Array>} - Retorna una lista de clientes que cumplen el filtro.
   */
  async findWithFilter(where) {
    throw new Error("Method not implemented");
  }

  /**
   * Crea un nuevo cliente.
   * @param {Object} data - Datos del cliente.
   * @returns {Promise<Object>} - Cliente creado.
   */
  async create(data) {
    throw new Error("Method not implemented");
  }

  /**
   * Actualiza un cliente.
   * @param {number} id - ID del cliente.
   * @param {Object} data - Datos actualizados.
   * @returns {Promise<number>} - Número de filas afectadas.
   */
  async update(id, data) {
    throw new Error("Method not implemented");
  }

  /**
   * Desactiva un cliente (marca el campo activo como false).
   * @param {number} id - ID del cliente.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async deactivate(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Reactiva un cliente (marca el campo activo como true).
   * @param {number} id - ID del cliente.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async reactivate(id) {
    throw new Error("Method not implemented");
  }
}

export default IClienteRepository;

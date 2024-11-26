export default class IProductoEstadisticasRepository {
    /**
     * Encuentra estadísticas de un producto por su ID.
     * @param {number} id_producto - ID del producto.
     * @returns {Promise<ProductoEstadisticas[]>}
     */
    async findByProductoId(id_producto) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Obtiene estadísticas de todos los productos.
     * @returns {Promise<ProductoEstadisticas[]>}
     */
    async findAll() {
      throw new Error("Method not implemented");
    }
  
    /**
     * Crea estadísticas para un producto.
     * @param {Object} data - Datos de estadísticas del producto.
     * @returns {Promise<ProductoEstadisticas>}
     */
    async create(data) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Actualiza las estadísticas de un producto.
     * @param {number} id - ID de las estadísticas.
     * @param {Object} data - Datos actualizados.
     * @returns {Promise<ProductoEstadisticas>}
     */
    async update(id, data) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Elimina estadísticas de un producto por su ID.
     * @param {number} id - ID de las estadísticas.
     * @returns {Promise<boolean>}
     */
    async delete(id) {
      throw new Error("Method not implemented");
    }
  }
  
export default class IVentasEstadisticasRepository {
    /**
     * Encuentra estadísticas de ventas asociadas a una transacción.
     * @param {number} id_transaccion - ID de la transacción.
     * @returns {Promise<VentasEstadisticas[]>}
     */
    async findByTransaccionId(id_transaccion) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Obtiene todas las estadísticas de ventas.
     * @returns {Promise<VentasEstadisticas[]>}
     */
    async findAll() {
      throw new Error("Method not implemented");
    }
  
    /**
     * Crea estadísticas para una transacción.
     * @param {Object} data - Datos de estadísticas de ventas.
     * @returns {Promise<VentasEstadisticas>}
     */
    async create(data) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Actualiza estadísticas de ventas para una transacción.
     * @param {number} id - ID de las estadísticas.
     * @param {Object} data - Datos actualizados.
     * @returns {Promise<VentasEstadisticas>}
     */
    async update(id, data) {
      throw new Error("Method not implemented");
    }
  
    /**
     * Elimina estadísticas de ventas por su ID.
     * @param {number} id - ID de las estadísticas.
     * @returns {Promise<boolean>}
     */
    async delete(id) {
      throw new Error("Method not implemented");
    }
  }
  
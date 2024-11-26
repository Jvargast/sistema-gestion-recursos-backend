class IInventarioRepository {
  /**
   * Encuentra un inventario por el ID del producto.
   * @param {number} id_producto - ID del producto.
   * @returns {Promise<Object|null>} - Retorna el inventario encontrado o null si no existe.
   */
  async findByProductoId(id_producto) {
    throw new Error("Method not implemented");
  }

  /**
   * Encuentra todos los inventarios.
   * @returns {Promise<Array>} - Retorna una lista de inventarios.
   */
  async findAll() {
    throw new Error("Method not implemented");
  }

  /**
   * Crea un nuevo registro de inventario.
   * @param {Object} data - Datos del inventario.
   * @returns {Promise<Object>} - Retorna el inventario creado.
   */
  async create(data) {
    throw new Error("Method not implemented");
  }

  /**
   * Actualiza un inventario existente.
   * @param {number} id_producto - ID del producto.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async update(id_producto, data) {
    throw new Error("Method not implemented");
  }

  /**
   * Elimina un inventario por el ID del producto.
   * @param {number} id_producto - ID del producto.
   * @returns {Promise<number>} - Retorna el número de filas afectadas.
   */
  async delete(id_producto) {
    throw new Error("Method not implemented");
  }

  /*
    Buscar inventario específico para un producto.
  */
  async findInventarioByProducto(idProducto) {
    throw new Error("Method not implemented");
  }

  /*
    Ajustar la cantidad de inventario para un producto (incrementar o decrementar).
  */
  async updateCantidad(idProducto, cantidad) {
    throw new Error("Method not implemented");
  }

  /*
    Obtener un resumen de inventario global para todos los productos.
  */
  async getInventarioGlobal() {
    throw new Error("Method not implemented");
  }

  /*
    Manejar la entrada de productos al inventario.
  */
  async registrarEntradaInventario(data) {
    throw new Error("Method not implemented");
  }

  /*
    Manejar la salida de productos desde el inventario.
  */
  async registrarSalidaInventario(data) {
    throw new Error("Method not implemented");
  }
}

export default IInventarioRepository;

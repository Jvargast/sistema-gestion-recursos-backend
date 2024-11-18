import ProductosRepository from "../infrastructure/repositories/ProductosRepository.js";
import CategoriaProductoRepository from "../infrastructure/repositories/CategoriaProductoRepository.js";
import TipoProductoRepository from "../infrastructure/repositories/TipoProductoRepository.js";
import EstadoProductoRepository from "../infrastructure/repositories/EstadoProductoRepository.js";
import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";

class ProductoService {
  async getProductoById(id) {
    ProductosRepository.findAll()
    const producto = await ProductosRepository.findById(id);
    if (!producto) throw new Error("Producto no encontrado.");
    const inventario = await InventarioRepository.findByProductoId(
      producto.id_producto
    );
    producto.dataValues.inventario = inventario;
    return producto;
  }

  async getAllProductos() {
    /* const productos = await ProductosRepository.findAll();

    for (const producto of productos) {
      const inventario = await InventarioRepository.findByProductoId(
        producto.id_producto
      );
      producto.dataValues.inventario = inventario;
      return productos;
    } */
    return await ProductosRepository.findAll();
  }

  async createProducto(data) {
    const { cantidad_inicial, ...productoData } = data;

    const categoria = await CategoriaProductoRepository.findById(
      productoData.id_categoria
    );
    if (!categoria) throw new Error("Categoría no encontrada.");

    const tipo = await TipoProductoRepository.findById(
      productoData.id_tipo_producto
    );
    if (!tipo) throw new Error("Tipo de producto no encontrado.");

    const estado = await EstadoProductoRepository.findById(
      productoData.id_estado_producto
    );
    if (!estado) throw new Error("Estado de producto no encontrado.");

    // Crear el producto
    const producto = await ProductosRepository.create(productoData);

    // Crear el inventario inicial para el producto
    if (cantidad_inicial !== undefined && cantidad_inicial >= 0) {
      await InventarioRepository.create({
        id_producto: producto.id_producto,
        cantidad: cantidad_inicial,
        fecha_actualizacion: new Date(),
      });
    }
    return await this.getProductoById(producto.id_producto);
  }

  async updateProducto(id, data) {
    const { cantidad, ...productoData } = data;

    // Actualizar el producto
    const updated = await ProductosRepository.update(id, productoData);
    if (updated[0] === 0) throw new Error("No se pudo actualizar el producto.");

    // Actualizar el inventario si se proporciona la cantidad
    if (cantidad !== undefined && cantidad >= 0) {
      await InventarioRepository.update(id, {
        cantidad,
        fecha_actualizacion: new Date(),
      });
    }

    return await this.getProductoById(id);
  }

  async deleteProducto(id) {
    const deletedInventario = await InventarioRepository.delete(id);
    const deletedProducto = await ProductosRepository.delete(id);

    if (deletedInventario === 0 || deletedProducto === 0) {
      throw new Error("No se pudo eliminar el producto o su inventario.");
    }

    return true;
  }

  async getProductosByTipo(tipo) {
    const tipoProducto = await TipoProductoRepository.findAll();
    const tipoId = tipoProducto.find((t) => t.nombre === tipo)?.id_tipo_producto;

    if (!tipoId) throw new Error('Tipo de producto no encontrado.');

    const productos = await ProductosRepository.findAll({
      where: { id_tipo_producto: tipoId },
    });

    for (const producto of productos) {
      const inventario = await InventarioRepository.findByProductoId(producto.id_producto);
      producto.dataValues.inventario = inventario;
    }

    return productos;
  }
}

export default new ProductoService();

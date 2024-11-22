import ProductosRepository from "../infrastructure/repositories/ProductosRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import TipoProductoService from "./TipoProductoService.js";
import EstadoProductoService from "./EstadoProductoService.js";
import InventarioService from "./InventarioService.js";
import CategoriaProductoService from "./CategoriaProductoService.js";

class ProductoService {
  async getProductoById(id) {
    ProductosRepository.findAll()
    const producto = await ProductosRepository.findById(id);
    if (!producto) throw new Error("Producto no encontrado.");

    // Incluir información de inventario
    const inventario = await InventarioService.getInventarioByProductoId(id);
    producto.dataValues.inventario = inventario;

    return producto;
  }

  async getAllProductos(filters = {}, options = {}) {
    const allowedFields = [
      "nombre_producto",
      "marca",
      "descripcion",
      "precio",
      "id_categoria",
      "id_tipo_producto",
      "id_estado_producto"
    ]
    const where = createFilter(filters, allowedFields);

    for (const producto of productos) {
      const inventario = await InventarioService.getInventarioByProductoId(
        producto.id_producto
      );
      producto.dataValues.inventario = inventario;
    }

    return await paginate(ProductosRepository.getModel(), options, {where})
  }

  async createProducto(data) {
    const { cantidad_inicial, ...productoData } = data;

    const categoria = await CategoriaProductoService.getCategoriaById(
      productoData.id_categoria
    );
    if (!categoria) throw new Error("Categoría no encontrada.");

    const tipo = await TipoProductoService.createTipo(
      productoData.id_tipo_producto
    );
    if (!tipo) throw new Error("Tipo de producto no encontrado.");

    const estado = await EstadoProductoService.getEstadoById(
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
      await InventarioService.updateInventario(id, {
        cantidad,
        fecha_actualizacion: new Date(),
      });
    }

    return await this.getProductoById(id);
  }

  async deleteProducto(id) {
    const deletedInventario = await InventarioService.deleteInventario(id);
    const deletedProducto = await ProductosRepository.delete(id);

    if (deletedInventario === 0 || deletedProducto === 0) {
      throw new Error("No se pudo eliminar el producto o su inventario.");
    }

    return true;
  }

  async getProductosByTipo(tipo) {
    const tipoProducto = await TipoProductoService.getAllTipos();
    const tipoId = tipoProducto.find((t) => t.nombre === tipo)?.id_tipo_producto;

    if (!tipoId) throw new Error('Tipo de producto no encontrado.');

    const productos = await ProductosRepository.findAll({
      where: { id_tipo_producto: tipoId },
    });

    for (const producto of productos) {
      const inventario = await InventarioService.getInventarioByProductoId(producto.id_producto);
      producto.dataValues.inventario = inventario;
    }

    return productos;
  }
}

export default new ProductoService();

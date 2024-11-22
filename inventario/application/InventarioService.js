import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";
import ProductosService from "./ProductosService.js";

class InventarioService {
  async getInventarioByProductoId(id_producto) {
    const inventario = await InventarioRepository.findByProductoId(id_producto);
    if (!inventario) throw new Error("Inventario no encontrado.");
    return inventario;
  }

  async getAllInventarios() {
    return await InventarioRepository.findAll();
  }

  async createInventario(data) {
    const producto = await ProductosService.getProductoById(data.id_producto);
    if (!producto) throw new Error("Producto no encontrado.");
    return await InventarioRepository.create(data);
  }

  async updateInventario(id_producto, data) {
    const updated = await InventarioRepository.update(id_producto, data);
    if (updated[0] === 0)
      throw new Error("No se pudo actualizar el inventario.");
    return await this.getInventarioByProductoId(id_producto);
  }

  async updateCantidadInventario(id_producto, cantidad) {
    const inventario = await this.getInventarioByProductoId(id_producto);

    const nuevaCantidad = inventario.cantidad + cantidad;
    if (nuevaCantidad < 0) {
      throw new Error(
        `Stock insuficiente para el producto con ID ${id_producto}.`
      );
    }

    return await InventarioRepository.update(id_producto, {
      cantidad: nuevaCantidad,
      fecha_actualizacion: new Date(),
    });
  }

  async verificarInventarioMinimo(id_producto, cantidadMinima) {
    const inventario = await this.getInventarioByProductoId(id_producto);

    if (inventario.cantidad < cantidadMinima) {
      console.warn(
        `El producto con ID ${id_producto} está por debajo del inventario mínimo.`
      );
    }

    return inventario.cantidad >= cantidadMinima;
  }

  async deleteInventario(id_producto) {
    const deleted = await InventarioRepository.delete(id_producto);
    if (deleted === 0) throw new Error("No se pudo eliminar el inventario.");
    return true;
  }
}

export default new InventarioService();

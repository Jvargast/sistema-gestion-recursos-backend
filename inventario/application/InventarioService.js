import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";
import LogInventarioRepository from "../infrastructure/repositories/LogInventarioRepository.js";
import ProductosService from "./ProductosService.js";

class InventarioService {
  async getInventarioByProductoId(id_producto) {
    const inventario = await InventarioRepository.findByProductoId(id_producto);
    if (!inventario) throw new Error("Inventario no encontrado.");
    return inventario;
  }

  async getInventarioByInsumoId(id_insumo) {
    const inventario = await InventarioRepository.findByInsumoId(id_insumo);
    if (!inventario) throw new Error("Inventario no encontrado.");
    return inventario;
  }

  async getAllInventarios() {
    return await InventarioRepository.findAll();
  }

  async addInventario(data) {
    const producto = await ProductosService.getProductoById(data.id_producto);
    if (!producto) throw new Error("Producto no encontrado.");
    return await InventarioRepository.create(data);
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

  // Actualizar el inventario
  async ajustarCantidadInventario(idProducto, cantidad, idUsuario) {
    const inventario = await InventarioRepository.findByProductoId(idProducto);
    if (!inventario) throw new Error("Inventario no encontrado.");

    const nuevaCantidad = inventario.cantidad + cantidad;
    if (nuevaCantidad < 0)
      throw new Error("La cantidad no puede ser negativa.");

    await InventarioRepository.update(idProducto, { cantidad: nuevaCantidad });

    if (idUsuario) {
      await LogInventarioRepository.createLog({
        id_producto: idProducto,
        cambio: cantidad,
        cantidad_final: nuevaCantidad,
        motivo: "Por compra",
        realizado_por: idUsuario,
        fecha: new Date(),
      });
    }
    const nuevoInventario = await InventarioRepository.findByProductoId(
      idProducto
    );

    return nuevoInventario;
  }

  async incrementStock(id_producto, cantidad) {
    const inventario = await this.getInventarioByProductoId(id_producto);
    if (!inventario) throw new Error("Producto no encontrado en inventario.");

    inventario.cantidad += cantidad;
    await InventarioRepository.update(id_producto, {
      cantidad: inventario.cantidad,
    });

    return inventario;
  }

  async validarDisponibilidad(id_producto, cantidad) {
    if (cantidad <= 0) {
      throw new Error("Cantidad debe ser un número positivo.");
    }

    // Obtener el inventario del producto
    const inventario = await this.getInventarioByProductoId(id_producto);
    if (!inventario) {
      throw new Error("Producto no encontrado en inventario.");
    }

    // Validar si el stock disponible es suficiente
    return Math.floor(inventario.cantidad) >= Math.floor(cantidad);
  }

  async decrementarStock(id_producto, cantidad) {
    // Validar cantidad positiva
    if (cantidad <= 0) {
      throw new Error("Cantidad debe ser un número positivo.");
    }
    const inventario = await this.getInventarioByProductoId(id_producto);
    if (!inventario) throw new Error("Producto no encontrado en inventario.");
    
    if (Math.floor(inventario.cantidad) < Math.floor(cantidad)) {
      throw new Error("Stock insuficiente en  InventarioService");
    }

    inventario.cantidad -= cantidad;
    await InventarioRepository.update(id_producto, {
      cantidad: inventario.cantidad,
    });

    return inventario;
  }

  async decrementarStockInsumo(id_insumo, cantidad) {
    if (cantidad <= 0) {
      throw new Error("Cantidad debe ser un número positivo.");
    }
    const inventario = await this.getInventarioByInsumoId(id_insumo);
    if (!inventario) throw new Error("Insumo no encontrado en inventario.");
    
    if (Math.floor(inventario.cantidad) < Math.floor(cantidad)) {
      throw new Error("Stock insuficiente en  InventarioService");
    }

    inventario.cantidad -= cantidad;
    await InventarioRepository.updateInsumo(id_insumo, {
      cantidad: inventario.cantidad,
    });

    return inventario;
  }
}

export default new InventarioService();

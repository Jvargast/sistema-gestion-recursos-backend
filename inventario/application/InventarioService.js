import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";
import LogInventarioRepository from "../infrastructure/repositories/LogInventarioRepository.js";
import ProductosService from "./ProductosService.js";
import TransicionEstadoProductoService from "./TransicionEstadoProductoService.js";

class InventarioService {
  async getInventarioByProductoId(id_producto) {
    const inventario = await InventarioRepository.findByProductoId(id_producto);
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
    if (nuevaCantidad < 0) throw new Error("La cantidad no puede ser negativa.");
  
    await InventarioRepository.update(idProducto, { cantidad: nuevaCantidad });
  
    if (idUsuario) {
      await LogInventarioRepository.createLog({
        id_producto: idProducto,
        cantidad_ajustada: cantidad,
        cantidad_resultante: nuevaCantidad,
        id_usuario: idUsuario,
      });
    }
  
    return await InventarioRepository.findByProductoId(idProducto);
  }

  // Actualizar el inventario basado en los productos y cantidades de una transacción concreta.
  async ajustarInventarioPorTransaccion(idTransaccion, detalles) {
    if (!idTransaccion) {
      throw new Error("Se requiere un ID de transacción válido.");
    }
    for (const detalle of detalles) {
      // Ajustar cantidad en inventario
      await this.ajustarCantidadInventario(
        detalle.id_producto,
        -detalle.cantidad
      );

      // Registrar la transición de estado del producto
      await TransicionEstadoProductoService.crearTransicionEstado(
        detalle.id_producto,
        "Disponible - Bodega",
        "En tránsito - Reservado",
        idTransaccion // Relacionar la transición con la transacción
      );

      // Registrar un log de inventario para el producto
      await InventarioLog.registrarCambio({
        id_producto: detalle.id_producto,
        id_transaccion: idTransaccion,
        cambio: -detalle.cantidad,
        motivo: "Transacción asociada",
        fecha: new Date(),
      });
    }

    return {
      message: `Inventario ajustado para la transacción ${idTransaccion}.`,
    };
  }
  // Registrar productos que han sido devueltos (ej., fallas, contaminación).
  async registrarDevolucionProducto(id_producto, estadoDevolucion, cantidad) {
    const inventario = await this.getInventarioByProductoId(id_producto);
    if (!inventario) throw new Error("Inventario no encontrado.");

    await this.updateCantidadInventario(id_producto, cantidad);

    await TransicionEstadoProductoService.crearTransicionEstado(
      id_producto,
      inventario.estado,
      estadoDevolucion
    );

    return {
      message: `Devolución registrada para el producto ${id_producto}.`,
    };
  }

  async obtenerLogsInventario() {
    return LogInve
  }

}

export default new InventarioService();

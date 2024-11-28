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
  /**
   *
   *
   *  AJUSTAR INVENTARIO POR TRANSACCION, PERO CREANDO TRANSICION
   *
   *
   */
  // Actualizar el inventario basado en los productos y cantidades de una transacción concreta.
  async ajustarInventarioPorTransaccion(id_usuario, id_transaccion, detalles) {
    if (!id_transaccion) {
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
        id_transaccion // Relacionar la transición con la transacción
      );

      let prodAct = await this.getInventarioByProductoId(detalle.id_producto);
      // Registrar un log de inventario para el producto
      await InventarioLog.registrarCambio({
        id_producto: detalle.id_producto,
        id_transaccion: id_transaccion,
        cambio: -detalle.cantidad,
        cantidad_final: prodAct.cantidad,
        motivo: "Transacción asociada",
        realizado_por: id_usuario,
        fecha: new Date(),
      });
    }

    return {
      message: `Inventario ajustado para la transacción ${id_transaccion}.`,
    };
  }

  // Registrar productos que han sido devueltos (ej., fallas, contaminación).
  async registrarDevolucionProducto(
    id_producto,
    id_usuario,
    id_estado_destino,
    cantidad
  ) {
    const inventario = await this.getInventarioByProductoId(id_producto);
    if (!inventario) throw new Error("Inventario no encontrado.");

    await this.ajustarCantidadInventario(id_producto, cantidad);

    await TransicionEstadoProductoService.crearTransicionEstado(
      id_usuario,
      id_producto,
      inventario.estado,
      id_estado_destino,
      (condicion = "Cambio de estado a retornado")
    );

    return {
      message: `Devolución registrada para el producto ${id_producto}.`,
    };
  }
}

export default new InventarioService();

import DetalleTransaccionRepository from "../infrastructure/repositories/DetalleTransaccionRepository.js";
import ProductosService from "../../inventario/application/ProductosService.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import TransaccionService from "./TransaccionService.js";
import LogTransaccionService from "./LogTransaccionService.js";
import InventarioService from "../../inventario/application/InventarioService.js";
import EstadoProductoService from "../../inventario/application/EstadoProductoService.js";
import TransaccionRepository from "../infrastructure/repositories/TransaccionRepository.js";

class DetalleTransaccionService {
  async getDetallesByTransaccionId(id_transaccion) {
    return await DetalleTransaccionRepository.findByTransaccionId(
      id_transaccion
    );
  }

  async completeTransaccion(id, id_usuario) {
    const transaccion = await TransaccionService.getTransaccionById(id);

    // Cambiar estado de la transacción
    const estadoCompletado = await EstadoTransaccionService.findByNombre(
      "Completada"
    );

    await TransaccionService.changeEstadoTransaccion(
      id,
      estadoCompletado.id_estado_transaccion,
      id_usuario
    );

    // Registrar log
    await LogTransaccionService.createLog({
      id_transaccion: id,
      id_usuario: id_usuario,
      accion: "Cambio de estado",
      detalles: `Estado cambiado a Completada`,
    });

    return transaccion;
  }

  async createDetalles(productos, id_transaccion, tipo_transaccion) {
    // Validar la transacción existente
    await TransaccionService.getTransaccionById(id_transaccion);

    // Procesar cada detalle
    const detallesData = await Promise.all(
      productos.map(async ({ id_producto, cantidad }) => {
        const producto = await ProductosService.getProductoById(id_producto);

        if (producto.id_estado_producto !== 1) {
          // Estado "Disponible"
          throw new Error(
            `Producto ${producto.nombre_producto} no está disponible.`
          );
        }
        const subtotal = producto.precio * cantidad;

        // Crear detalle con precio obtenido del producto
        return {
          id_transaccion,
          id_producto,
          cantidad,
          precio_unitario: producto.precio,
          descuento: 0, // Si no hay descuentos, se puede ajustar más tarde
          subtotal,
        };
      })
    );
    // Crear los detalles en la base de datos
    const detallesCreados = await DetalleTransaccionRepository.bulkCreate(
      detallesData
    );

    // Realizar ajustes en inventario si el tipo de transacción lo requiere
    if (["venta", "pedido"].includes(tipo_transaccion)) {
      await Promise.all(
        productos.map(async ({ id_producto, cantidad }) => {
          await InventarioService.updateInventario(id_producto, -cantidad);
        })
      );
    }

    return detallesCreados;
  }

  async updateDetalle(id_detalle, data) {
    const detalle = await DetalleTransaccionRepository.findById(id_detalle);
    if (!detalle) {
      throw new Error("Detalle de transacción no encontrado.");
    }

    // Actualizar inventario si la cantidad cambia
    if (data.cantidad && data.cantidad !== detalle.cantidad) {
      const diferencia = data.cantidad - detalle.cantidad;
      // Ajustar inventario según el tipo de transacción
      if (["venta", "pedido"].includes(tipo_transaccion)) {
        await InventarioService.updateInventario(
          detalle.id_producto,
          -diferencia
        );
      }
    }
    return await DetalleTransaccionRepository.update(id_detalle, data);
  }

  async deleteDetalles(ids_detalles, tipo_transaccion) {
    const detalles = await DetalleTransaccionRepository.findByIds(ids_detalles);

    for (const detalle of detalles) {
      if (["venta", "pedido"].includes(tipo_transaccion)) {
        await InventarioService.updateInventario(
          detalle.id_producto,
          detalle.cantidad
        );
        const estadoDisponible = await EstadoProductoService.getEstadoByNombre(
          "Disponible"
        );
        await ProductosService.updateProducto(detalle.id_producto, {
          id_estado_producto: estadoDisponible.id_estado_producto,
        });
      }
    }

    return await DetalleTransaccionRepository.bulkDelete(ids_detalles);
  }

  async calcularTotales(id_transaccion) {
    const detalles = await this.getDetallesByTransaccionId(id_transaccion);
    const total = detalles.reduce(
      (acc, detalle) => acc + detalle.cantidad * detalle.precio_unitario,
      0
    );

    // Solo se actualiza el total en la transacción
    await TransaccionRepository.update(id_transaccion, { total });
    //await TransaccionService.changeEstadoTransaccion(id_transaccion, { total });
    //
    /*     const estadoFinalizado = await EstadoTransaccionService.findByNombre(
      "Total Finalizado"
    );
    if (estadoFinalizado) {
      await TransaccionService.changeEstadoTransaccion(
        id_transaccion,
        estadoFinalizado.id_estado_transaccion,
        id_usuario
      );
    } */
    return total;
  }

  /*   async deleteDetallesByTransaccionId(id_transaccion) {
    const detalles = await this.getDetallesByTransaccionId(id_transaccion);
  
    if (!detalles || detalles.length === 0) {
      throw new Error(
        `No se encontraron detalles para la transacción con ID ${id_transaccion}.`
      );
    }
  
    // Restaurar inventario antes de eliminar los detalles
    for (const detalle of detalles) {
      await InventarioService.updateInventario(detalle.id_producto, detalle.cantidad);
    }
  
    return await DetalleTransaccionRepository.deleteByTransaccionId(
      id_transaccion
    );
  } */
}

export default new DetalleTransaccionService();

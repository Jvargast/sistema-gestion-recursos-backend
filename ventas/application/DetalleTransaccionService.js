import DetalleTransaccionRepository from "../infrastructure/repositories/DetalleTransaccionRepository.js";
import ProductosService from "../../inventario/application/ProductosService.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import TransaccionService from "./TransaccionService.js";
import LogTransaccionService from "./LogTransaccionService.js";
import InventarioService from "../../inventario/application/InventarioService.js";
import TransaccionRepository from "../infrastructure/repositories/TransaccionRepository.js";
import EstadoDetalleTransaccionService from "./EstadoDetalleTransaccionService.js";
import TransicionEstadoDetalleTransaccionService from "./TransicionEstadoDetalleTransaccionService.js";

class DetalleTransaccionService {

  async getDetallesByTransaccionId(id_transaccion) {
    return await DetalleTransaccionRepository.findByTransaccionId(
      id_transaccion
    );
  }

/*   async completeTransaccion(id, id_usuario) {
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
  } */

  async createDetallesTransaccion(
    productos,
    id_transaccion,
    /* tipo_transaccion,
    id_usuario */
  ) {
    // Validar la transacción existente
    await TransaccionService.getTransaccionById(
      id_transaccion
    );

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

        //Validar estado inicial del producto según el tipo de transacción
        // No se debería considerar cambiar el estado del detalle, hasta que se complete la transacción o si?
        /* const estadoDetalle =
          tipo_transaccion === "cotización"
            ? await EstadoDetalleTransaccionService.findByNombre("En bodega - Disponible")
            : await EstadoDetalleTransaccionService.findByNombre("En bodega - Reservado"); */

        const estadoInicialDetalle  =
          await EstadoDetalleTransaccionService.findByNombre(
            "En bodega - Disponible"
          );

        // Crear detalle con precio obtenido del producto
        return {
          id_transaccion,
          id_producto,
          cantidad,
          precio_unitario: producto.precio,
          descuento: 0, // Si no hay descuentos, se puede ajustar más tarde
          subtotal,
          estado_producto_transaccion: estadoInicialDetalle.dataValues.id_estado_detalle_transaccion,
        };
      })
    );
    // Crear los detalles en la base de datos
    const detallesCreados = await DetalleTransaccionRepository.bulkCreate(
      detallesData
    );

    // Realizar ajustes en inventario si el tipo de transacción lo requiere
    /* if (["venta", "pedido"].includes(tipo_transaccion)) {
      await Promise.all(
        productos.map(async ({ id_producto, cantidad }) => {
          await InventarioService.ajustarCantidadInventario(
            id_producto,
            -cantidad,
            id_usuario
          );
        })
      );
    } */

    return detallesCreados;
  }
  // Es requerido cambiar el estado de los detalles para el movimiento de productos
  async cambiarEstadoDetalles(id_transaccion, nuevoEstado, id_usuario) {
    const detalles = await this.getDetallesByTransaccionId(id_transaccion);
    if (!detalles || detalles.length === 0) {
      throw new Error("No se encontraron detalles para esta transacción.");
    }
    const nuevo_estado = await EstadoDetalleTransaccionService.findById(nuevoEstado);
    const ids = detalles.map((detalle) => ({
      estado_origen: detalle.estado_producto_transaccion,
    }))
    
    // Validar transición de estado
    await TransicionEstadoDetalleTransaccionService.validarTransicionesMasivas(
      ids,
      nuevo_estado.dataValues.id_estado_detalle_transaccion
    );
  
    // Actualizar el estado de todos los detalles
    await Promise.all(
      detalles.map((detalle) =>
        DetalleTransaccionRepository.update(detalle.id_detalle_transaccion, {
          estado_producto_transaccion: nuevoEstado,
        })
      )
    );
  
    // Registrar log del cambio de estado
    await LogTransaccionService.createLog({
      id_transaccion,
      id_usuario,
      estado: nuevo_estado.dataValues.nombre_estado,
      accion: "Cambio de estado de detalles",
      detalles: `Detalles actualizados al estado: ${nuevo_estado.dataValues.nombre_estado}`,
    });
  
    return { mensaje: "Estados de detalles actualizados con éxito." };
  }

  // Se puede seguir trabajando para lograr el estado del producto en el detalle, como si fuera el carrito
  async updateDetallesTransaccion(id_detalle, data) {
    const {
      nuevoEstado,
      cantidad,
      id_usuario,
      precio_unitario,
      descuento,
      subtotal,
    } = data;

    const detalle = await DetalleTransaccionRepository.findById(id_detalle);
    if (!detalle) {
      throw new Error("Detalle de transacción no encontrado.");
    }

    // Validar transición de estado usando el nuevo servicio
    if (nuevoEstado) {
      await TransicionEstadoDetalleService.validarTransicion(
        detalle.estado_producto_transaccion,
        nuevoEstado
      );
    }

    // Actualizar inventario si la cantidad cambia
    if (cantidad && cantidad !== detalle.cantidad) {
      const diferencia = cantidad - detalle.cantidad;
      // Ajustar inventario según el tipo de transacción
      if (["venta", "pedido"].includes(tipo_transaccion)) {
        await InventarioService.ajustarCantidadInventario(
          detalle.id_producto,
          -diferencia,
          id_usuario
        );
      }
    }
    return await DetalleTransaccionRepository.update(id_detalle, {
      cantidad: cantidad,
      precio_unitario: precio_unitario,
      descuento: descuento,
      subtotal: subtotal,
      estado_producto_transaccion: nuevoEstado,
    });
  }

  async deleteDetallesTransaccion(ids_detalles, tipo_transaccion, id_usuario) {
    const detalles = await DetalleTransaccionRepository.findByIds(ids_detalles);

    for (const detalle of detalles) {
      if (["venta", "pedido"].includes(tipo_transaccion)) {
        await InventarioService.ajustarCantidadInventario(
          detalle.id_producto,
          detalle.cantidad,
          id_usuario
        );
        // Cambiar estado del detalle a "Eliminado"
        const estadoEliminado =
          await EstadoDetalleTransaccionService.findByNombre("Eliminado");
        await DetalleTransaccionRepository.update(
          detalle.id_detalle_transaccion,
          {
            estado_producto_transaccion: estadoEliminado.id_estado,
          }
        );
        /* await ProductosService.updateProducto(detalle.id_producto, {
          id_estado_producto: estadoDisponible.id_estado_producto,
        }); */
      }
    }

    return { message: "Detalles eliminados con éxito.", estado: true };
  }

  async calcularTotales(id_transaccion) {
    const detalles = await this.getDetallesByTransaccionId(id_transaccion);
    const total = detalles.reduce(
      (acc, detalle) => acc + detalle.cantidad * detalle.precio_unitario,
      0
    );

    await TransaccionRepository.update(id_transaccion, { total });
    return total;
  }

  //Revisión posterior eliminar varios detalles de uns transaccion
  async deleteDetallesByTransaccionId(id_transaccion) {
    const detalles = await DetalleTransaccionRepository.findByTransaccionId(
      id_transaccion
    );

    if (!detalles || detalles.length === 0) {
      return; // No hay detalles asociados, no hay nada que eliminar
    }

    await DetalleTransaccionRepository.bulkDelete(
      detalles.map((detalle) => detalle.id_detalle_transaccion)
    );
  }

}

export default new DetalleTransaccionService();

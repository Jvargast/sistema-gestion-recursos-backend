import DetalleTransaccionRepository from "../infrastructure/repositories/DetalleTransaccionRepository.js";
import ProductosService from "../../inventario/application/ProductosService.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import TransaccionService from "./TransaccionService.js";
import LogTransaccionService from "./LogTransaccionService.js";
import InventarioService from "../../inventario/application/InventarioService.js";
import EstadoProductoService from "../../inventario/application/EstadoProductoService.js";

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
      { id_estado_transaccion: estadoCompletado.id_estado_transaccion },
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

  async createDetalles(detalles, id_transaccion, tipo_transaccion) {
    for (const detalle of detalles) {
      const producto = await ProductosService.getProductoById(
        detalle.id_producto
      );

      // Ajustar inventario y cambiar estado del producto según tipo de transacción
      if (["venta", "pedido", "factura"].includes(tipo_transaccion)) {
        await InventarioService.updateInventario(detalle.id_producto, {
          cantidad: -detalle.cantidad,
        });

        let nuevoEstado;
        if (tipo_transaccion === "venta") nuevoEstado = "Vendido";
        else if (tipo_transaccion === "pedido") nuevoEstado = "En_Transito";
        else nuevoEstado = "Reservado";

        const estado = await EstadoProductoService.getEstadoByNombre(
          nuevoEstado
        );
        await ProductosService.updateProducto(detalle.id_producto, {
          id_estado_producto: estado.id_estado_producto,
        });
      }
    }
    /* if (!producto || producto.estado.nombre_estado !== "Disponible") {
        throw new Error(`Producto ${detalle.id_producto} no disponible.`);
      }

      //Aqui verifciar
      // Ajustar inventario según el tipo de transacción
      if (["venta", "pedido", "factura"].includes(tipo_transaccion)) {
        await InventarioService.updateInventario(detalle.id_producto, -detalle.cantidad);
      }

      // Cambiar el estado del producto si aplica
      if (tipo_transaccion === "venta") {
        await ProductosService.update(detalle.id_producto, { estado: "Vendido" });
      } else if (tipo_transaccion === "pedido") {
        await ProductosService.update(detalle.id_producto, { estado: "En_Transito" });
      }
    */

    // Crear los detalles en la base de datos
    const detallesData = detalles.map((detalle) => ({
      ...detalle,
      id_transaccion,
    }));
    return await DetalleTransaccionRepository.bulkCreate(detallesData);
  }

  async updateDetalle(id_detalle, data) {
    const detalle = await DetalleTransaccionRepository.findById(id_detalle);
    if (!detalle) {
      throw new Error("Detalle de transacción no encontrado.");
    }

    // Actualizar inventario si la cantidad cambia
    if (data.cantidad && data.cantidad !== detalle.cantidad) {
      const diferencia = data.cantidad - detalle.cantidad;
      await InventarioService.updateInventario(detalle.id_producto, {
        cantidad: -diferencia,
      });
    }

    return await DetalleTransaccionRepository.update(id_detalle, data);
  }

  async deleteDetalles(ids_detalles, tipo_transaccion) {
    const detalles = await DetalleTransaccionRepository.findByIds(ids_detalles);

    for (const detalle of detalles) {
      if (["venta", "pedido"].includes(tipo_transaccion)) {
        await InventarioService.updateInventario(detalle.id_producto, {
          cantidad: detalle.cantidad,
        });
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
    const total = detalles.reduce((acc, detalle) => acc + detalle.cantidad * detalle.precio_unitario, 0);
    return total;
  }
}

export default new DetalleTransaccionService();

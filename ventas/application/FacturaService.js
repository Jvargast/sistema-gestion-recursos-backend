import InventarioService from "../../inventario/application/InventarioService.js";
import FacturaRepository from "../infrastructure/repositories/FacturaRepository.js";
import DetalleTransaccionService from "./DetalleTransaccionService.js";
import TransaccionService from "./TransaccionService.js";
import EstadoFacturaService from "./EstadoFacturaService.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";

class FacturaService {
  // Obtener una factura por ID
  async getFacturaById(id) {
    const factura = await FacturaRepository.findById(id);
    if (!factura) {
      throw new Error(`Factura con ID ${id} no encontrada.`);
    }
    return factura;
  }
  // Obtener todas las facturas con filtros y paginación
  async getAllFacturas(filters = {}, options = { page: 1, limit: 10 }) {
    return await FacturaRepository.findAll(filters, options);
  }

  // Crear una factura independiente (sin transacción asociada)
  async crearFacturaIndependiente(data) {
    const facturaData = {
      fecha_emision: new Date(),
      total: data.total,
      ...data,
    };

    return await FacturaRepository.create(facturaData);
  }

  async generarFactura(id_transaccion, id_usuario) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    // Validar que la transacción esté en un estado adecuado para emitir factura
    const estadoCompletado = await EstadoTransaccionService.findByNombre("Completada")
    if (transaccion.id_estado_transaccion !== estadoCompletado.id_estado_transaccion) {
      throw new Error(
        "La transacción debe estar completada para generar una factura."
      );
    }
    const estadoFacturaCompletado = await EstadoFacturaService.findByNombre("Creada")
    const factura = await FacturaRepository.create({
      id_transaccion,
      id_cliente: transaccion.id_cliente,
      id_usuario,
      total: transaccion.total,
      id_estado_factura: estadoFacturaCompletado.id_estado_Factura
    });

    return factura;
  }

  async generarBoleta(id_transaccion, id_usuario) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    // Validar que la transacción esté en un estado adecuado para emitir boleta
    const estadoCompletado = await EstadoTransaccionService.findByNombre("Completada")
    if (transaccion.id_estado_transaccion !== estadoCompletado.id_estado_transaccion) {
      throw new Error(
        "La transacción debe estar completada para generar una boleta."
      );
    }
    const estadoFacturaCompletado = await EstadoFacturaService.findByNombre("Pagada")
    const boleta = await FacturaRepository.create({
      id_transaccion,
      id_cliente: transaccion.id_cliente,
      id_usuario,
      total: transaccion.total,
      id_estado_factura: estadoFacturaCompletado.id_estado_Factura, // Las boletas suelen considerarse pagadas automáticamente
    });

    return boleta;
  }

  async crearFacturaDesdeTransaccion(id_transaccion, id_usuario, data) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    if (!transaccion) throw new Error("Transacción no encontrada.");

    if (transaccion.id_estado_transaccion !== "Completada") {
      throw new Error("Solo se pueden facturar transacciones completadas.");
    }

    const total = transaccion.total;
    const numeroFactura = await this.generarNumeroFactura(); // Método para generar el número.

    const estadoInicial = await EstadoFacturaService.findByNombre("Creada");

    const facturaData = {
      id_transaccion,
      numero_factura: numeroFactura,
      fecha_emision: data.fecha_emision || new Date(),
      total: total,
      estado_factura: estadoInicial,
      ...data,
    };

    const factura = await FacturaRepository.create(facturaData);

    /**
     *
     *
     * Revisar si es necesario cambiar el estado de la transacción
     *
     *
     *
     *
     */
    /* const estadoSiguiente = await EstadoTransaccionService.findByNombre(
      "Completada - Facturada"
    );

    // Actualizar estado de la transacción a "Facturada" si es necesario
    await TransaccionService.changeEstadoTransaccion(
      id_transaccion,
      estadoSiguiente,
      id_usuario
    ); */

    return factura;
  }
  /* Generar Factura para una Transacción */
  async generarFacturaParaTransaccion(
    id_transaccion,
    id_estado_factura,
    id_usuario
  ) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    if (transaccion.estado !== "Pagada") {
      throw new Error("Solo se puede facturar una transacción pagada");
    }

    return await this.crearFacturaIndependiente({
      id_transaccion,
      id_cliente: transaccion.id_cliente,
      total: transaccion.total,
      fecha: new Date(),
      id_usuario,
      estado: id_estado_factura,
    });
  }

  async actualizarEstadoFactura(id_factura, nuevo_estado) {
    const estado = await EstadoFacturaService.findById(nuevo_estado);

    if (!estado) throw new Error("estado no encontrado.");

    const factura = await FacturaRepository.findById(id_factura);

    if (!factura) throw new Error("Factura no encontrada.");

    await FacturaRepository.update(id_factura, {
      estado_factura: nuevo_estado,
    });

    return { message: "Estado de factura actualizado con éxito" };
  }

  async ajustarInventarioPorFactura(id_factura) {
    const factura = await this.getFacturaById(id_factura);

    if (!factura) throw new Error("Factura no encontrada.");

    const detalles = await DetalleTransaccionService.getDetallesByTransaccionId(
      factura.id_transaccion
    );

    for (const detalle of detalles) {
      await InventarioService.ajustarCantidadInventario(
        detalle.id_producto,
        -detalle.cantidad,
        factura.id_usuario
      );
    }

    return { message: "Inventario ajustado por factura emitida" };
  }
  // Eliminar una factura (borrado lógico)
  async eliminarFactura(id) {
    const factura = await FacturaRepository.findById(id);
    if (!factura) {
      throw new Error(`Factura con ID ${id} no encontrada.`);
    }

    await FacturaRepository.update(id, { estado: "Eliminada" });

    return { message: "Factura eliminada exitosamente." };
  }
}

export default new FacturaService();

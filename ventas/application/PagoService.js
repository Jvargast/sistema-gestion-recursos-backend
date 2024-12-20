import PagoRepository from "../infrastructure/repositories/PagoRepository.js";
import EstadoFacturaService from "./EstadoFacturaService.js";
import EstadoPagoService from "./EstadoPagoService.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import FacturaService from "./FacturaService.js";
import MetodoPagoService from "./MetodoPagoService.js";
import TransaccionService from "./TransaccionService.js";

class PagoService {
  async crearPago(id_transaccion, metodo_pago) {
    const metodoPago = await MetodoPagoService.getMetodoByNombre(metodo_pago);

    if (!metodoPago) {
      throw new Error("Método de pago no encontrado");
    }
    const estadoInicial = await EstadoPagoService.findByNombre("Pendiente");

    const nuevoPago = await PagoRepository.create({
      id_transaccion,
      id_estado_pago: estadoInicial.dataValues.id_estado_pago,
      id_metodo_pago: metodoPago.dataValues.id_metodo_pago,
      monto: 0,
    });

    return nuevoPago;
  }
  async acreditarPago(
    id_transaccion,
    monto,
    metodo_pago,
    referencia,
    id_usuario
  ) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );
    if (!transaccion) {
      throw new Error("Transacción no encontrada");
    }
    // Validar estado de la transacción
    const estadoPermitido = await EstadoTransaccionService.findByNombre(
      "Pago Pendiente"
    );

    if (
      transaccion.transaccion.dataValues.id_estado_transaccion !=
      estadoPermitido.dataValues.id_estado_transaccion
    ) {
      throw new Error(
        "El pago no se puede acreditar, se debe cambiar de estado"
      );
    }

    // Validar método de pago
    if (
      ![
        "Efectivo",
        "Tarjeta_credito",
        "Tarjeta_debito",
        "Transferencia",
      ].includes(metodo_pago)
    ) {
      throw new Error("Método de pago no válido.");
    }

    // Validación del monto del pago, que sea igual o no al total
    if (monto <= 0) {
      throw new Error("El monto del pago debe ser mayor a cero.");
    }
    const montoTransaccion = transaccion.transaccion.dataValues.total;
    if (monto !== montoTransaccion) {
      throw new Error(`El pago no coincide con el ${montoTransaccion} `);
    }

    // Obtener datos del método de pago y estado "Pagado"
    const metodoPago = await MetodoPagoService.getMetodoByConditions({
      nombre: metodo_pago,
    });
    const estadoPagado = await EstadoPagoService.findByNombre("Pagado");
    // Registrar el pago
    const pago = await PagoRepository.create({
      id_transaccion,
      monto,
      id_metodo_pago: metodoPago[0].dataValues.id_metodo_pago,
      referencia,
      id_estado_pago: estadoPagado.dataValues.id_estado_pago,
      fecha_pago: new Date(),
    });

    const estadoPagadoTransaccion = await EstadoTransaccionService.findByNombre(
      "Pagada"
    );

    // Cambiar el estado de la transacción
    await TransaccionService.changeEstadoTransaccion(
      id_transaccion,
      estadoPagadoTransaccion.dataValues.id_estado_transaccion,
      id_usuario
    );

    // Si hay una factura asociada, actualizar su estado a "Pagada"
    if (transaccion.transaccion.dataValues.id_factura != null) {
      const estadoFacturaPagada = await EstadoFacturaService.findByNombre(
        "Pagada"
      );
      await FacturaService.actualizarEstadoFactura(
        transaccion.transaccion.dataValues.id_factura,
        estadoFacturaPagada.dataValues.id_estado_factura
      );
    }

    return pago;
  }

  async obtenerPagosPorTransaccion(id_transaccion) {
    const pagos = await PagoRepository.findByTransaccionId(id_transaccion);
    return pagos;
  }

  async cambiarEstadoPago(id_pago, nuevo_estado) {
    const estado = await EstadoPagoService.findById(nuevo_estado);
    if (!estado) {
      throw new Error("Estado de pago no válido.");
    }

    const pagoActualizado = await PagoRepository.updateEstado(
      id_pago,
      nuevo_estado
    );

    // Registrar log si es necesario
    return {
      message: `Estado del pago actualizado a ${estado.nombre}.`,
      pagoActualizado,
    };
  }

  async actualizarMetodoPago(id_pago, id_metodo_pago) {
    const metodoPagoNuevo = await PagoRepository.updatePago(
      id_pago,
      id_metodo_pago
    );
    return metodoPagoNuevo;
  }

  async obtenerMetodosPago() {
    return await MetodoPagoService.getMetodosPago();
  }
}
export default new PagoService();

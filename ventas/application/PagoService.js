import PagoRepository from "../infrastructure/repositories/PagoRepository.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import TransaccionService from "./TransaccionService.js";

class PagoService {
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

    if (
      transaccion.estado === "Completada" ||
      transaccion.estado === "Pagada"
    ) {
      throw new Error("El pago ya ha sido acreditado");
    }

    const estadoPagado = await EstadoPagoService.findByNombre("Pagado");
    const estadoPagadoTransaccion = await EstadoTransaccionService.findByNombre(
      "Pagado"
    );

    // Registrar el pago
    const pago = await PagoRepository.create({
      id_transaccion,
      monto,
      id_metodo_pago: metodo_pago,
      referencia,
      id_estado_pago: estadoPagado,
      fecha_pago: new Date(),
    });

    // Cambiar el estado de la transacción
    await TransaccionService.changeEstadoTransaccion(
      id_transaccion,
      estadoPagadoTransaccion.id_estado_pago,
      id_usuario
    );

    return { message: "Pago acreditado con éxito", pago };
  }

  async obtenerPagosPorTransaccion(id_transaccion) {
    const pagos = await PagoRepository.findByTransaccionId(id_transaccion);
    if (!pagos || pagos.length === 0) {
      throw new Error(
        `No se encontraron pagos para la transacción ${id_transaccion}.`
      );
    }
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
}
export default new PagoService();

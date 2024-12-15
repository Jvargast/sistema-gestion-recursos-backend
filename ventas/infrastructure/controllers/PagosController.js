import PagoService from "../../application/PagoService.js";

class PagoController {
  async acreditarPago(req, res) {
    try {
      const { id_transaccion, monto, metodo_pago, referencia } = req.body;
      const { rut } = req.user; // Suponiendo que el usuario autenticado está disponible en req.user

      const result = await PagoService.acreditarPago(
        id_transaccion,
        monto,
        metodo_pago,
        referencia,
        rut
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async obtenerPagosPorTransaccion(req, res) {
    try {
      const { id_transaccion } = req.params;
      const pagos = await PagoService.obtenerPagosPorTransaccion(
        id_transaccion
      );

      res.status(200).json(pagos);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async obtenerMetodosDePago(req, res) {
    try {
      const estados = await PagoService.obtenerMetodosPago();
      res.status(200).json(estados);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async cambiarEstadoPago(req, res) {
    try {
      const { id_pago } = req.params;
      const { nuevo_estado } = req.body;

      const result = await PagoService.cambiarEstadoPago(id_pago, nuevo_estado);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new PagoController();

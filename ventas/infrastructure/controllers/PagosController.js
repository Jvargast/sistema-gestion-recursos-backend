import PagoService from "../../application/PagoService.js";

class PagoController {
  async getPagoById(req, res) {
    try {
      const { id } = req.params;
      const pago = await PagoService.obtenerPagoPorId(id);
      res.status(200).json(pago);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  async getPagosByVentaId(req, res) {
    try {
      const { id_venta } = req.params;
      const pagos = await PagoService.getPagosByVentaId(id_venta);
      res.status(200).json(pagos);
    } catch (error) {
      console.error("Error al obtener pagos por venta:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
  async getAllPagos(req, res) {
    try {
      const filters = req.query;
      const rolId = req.user?.rol;
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 20) || 20,
        search: req.query.search,
        rolId,
      };
      delete filters.limit;
      delete filters.offset;
      const pagos = await PagoService.obtenerTodosLosPagos(filters, options);
      res.status(200).json({ data: pagos.data, total: pagos.pagination });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePago(req, res) {
    try {
      const { id } = req.params;
      const { monto, referencia, id_transaccion } = req.body;

      const pagoUpdated = await PagoService.actualizarPago(
        id,
        monto,
        referencia,
        id_transaccion
      );
      res.status(200).json(pagoUpdated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePago(req, res) {
    try {
      const actualizado = await PagoService.actualizarPago(
        req.params.id,
        req.body
      );
      res.json(actualizado);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deletePago(req, res) {
    try {
      await PagoService.eliminarPago(req.params.id);
      res.json({ message: "Pago eliminado." });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new PagoController();

import PagoService from "../../application/PagoService.js";

class PagoController {
  async getPagoById(req, res) {
    try {
      const { id } = req.params;
      const pago = await PagoService.getPagoById(id);
      res.status(200).json(pago);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  async getAllPagos(req, res) {
    try {
      const filters = req.query;
      const rolId = req.user.rol.id;
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
      const { monto, referencia, id_transaccion} = req.body;
      
      const pagoUpdated = await PagoService.updatePagoById(id, monto, referencia, id_transaccion);
      res.status(200).json(pagoUpdated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

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

  async registrarMetodoPago(req, res) {
    try {
      const { id } = req.params;
      const { metodo_pago } = req.body;

      const result = await PagoService.registrarMetodoPago(id, metodo_pago);
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

  async deletePagos(req, res) {
    try {
      const { ids } = req.body;
      const { rut } = req.user;

      const result = await PagoService.deletePagos(ids, rut);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new PagoController();

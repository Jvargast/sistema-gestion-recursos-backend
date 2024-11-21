import DetalleTransaccionService from "../../application/DetalleTransaccionService.js";

class DetalleTransaccionController {
  async getDetallesByTransaccionId(req, res) {
    try {
      const { id_transaccion } = req.params;
      const detalles = await DetalleTransaccionService.getDetallesByTransaccionId(id_transaccion);
      res.status(200).json(detalles);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createDetalles(req, res) {
    try {
      const { id_transaccion, tipo_transaccion } = req.body;
      const { detalles } = req.body;
      await DetalleTransaccionService.createDetalles(detalles, id_transaccion, tipo_transaccion);
      res.status(201).json({ message: "Detalles creados exitosamente." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateDetalle(req, res) {
    try {
      const { id_detalle } = req.params;
      const data = req.body;
      const updated = await DetalleTransaccionService.updateDetalle(id_detalle, data);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteDetalles(req, res) {
    try {
      const { ids_detalles, tipo_transaccion } = req.body;
      const result = await DetalleTransaccionService.deleteDetalles(ids_detalles, tipo_transaccion);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async calcularTotales(req, res) {
    try {
      const { id_transaccion } = req.params;
      const total = await DetalleTransaccionService.calcularTotales(id_transaccion);
      res.status(200).json({ total });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new DetalleTransaccionController();

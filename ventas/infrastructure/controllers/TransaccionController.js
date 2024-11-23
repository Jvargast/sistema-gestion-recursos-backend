import TransaccionService from "../../application/TransaccionService.js";

class TransaccionController {
  async getTransaccionById(req, res) {
    try {
      const { id } = req.params;
      const transaccion = await TransaccionService.getTransaccionById(id);
      res.status(200).json(transaccion);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllTransacciones(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      };
      delete filters.limit;
      delete filters.offset;
      const transacciones = await TransaccionService.getAllTransacciones(filters, options);
      res.status(200).json(transacciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTransaccion(req, res) {
    try {
      const { detalles, ...data } = req.body;
      const transaccion = await TransaccionService.createTransaccion(data, detalles);
      res.status(201).json(transaccion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addDetallesToTransaccion(req, res) {
    try {
      const { id_transaccion } = req.params;
      const { detalles } = req.body;
      const { id_usuario } = req.user; // Se obtiene del token del usuario autenticado
      await TransaccionService.addDetallesToTransaccion(id_transaccion, detalles, id_usuario);
      res.status(200).json({ message: "Detalles agregados a la transacción con éxito." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeEstado(req, res) {
    try {
      const { id } = req.params;
      const { id_estado_transaccion } = req.body;
      const { id_usuario } = req.user;
      const updated = await TransaccionService.changeEstadoTransaccion(id, id_estado_transaccion, id_usuario);
      res.status(200).json({ message: "Estado de la transacción cambiada con éxito." }, updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeTipoTransaccion(req, res) {
    try {
      const { id } = req.params;
      const { tipo_transaccion } = req.body;
      const { id_usuario } = req.user;
      const updated = await TransaccionService.changeTipoTransaccion(id, tipo_transaccion, id_usuario);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTransacciones(req, res) {
    try {
      const { ids } = req.body;
      //const { id_usuario } = req.user;
      const result = await TransaccionService.deleteTransacciones(ids, "12345678-9");
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new TransaccionController();

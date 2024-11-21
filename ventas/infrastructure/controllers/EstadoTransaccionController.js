import EstadoTransaccionService from "../../application/EstadoTransaccionService.js";

class EstadoTransaccionController {
  async getEstadoById(req, res) {
    try {
      const { id } = req.params;
      const estado = await EstadoTransaccionService.getEstadoById(id);
      res.status(200).json(estado);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllEstados(req, res) {
    try {
      const estados = await EstadoTransaccionService.getAllEstados();
      res.status(200).json(estados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createEstado(req, res) {
    try {
      const estado = await EstadoTransaccionService.createEstado(req.body);
      res.status(201).json(estado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const updated = await EstadoTransaccionService.updateEstado(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEstado(req, res) {
    try {
      const { id } = req.params;
      const result = await EstadoTransaccionService.deleteEstado(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new EstadoTransaccionController();

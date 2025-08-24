import EntregaService from "../../application/EntregaService.js";

class EntregaController {
  async createEntrega(req, res) {
    try {
      const id_chofer = req.user.id;
      const payload = { ...req.body, id_chofer };

      const result = await EntregaService.processDelivery(payload);

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEntregaById(req, res) {
    try {
      const { id } = req.params;
      const entrega = await EntregaService.getEntregaById(id);
      res.status(200).json(entrega);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, choferId } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };

      const entregas = await EntregaService.getEntregasPorChofer(
        choferId,
        options
      );

      res.status(200).json(entregas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEntregasByAgendaId(req, res) {
    try {
      const { page = 1, limit = 10, id_agenda_viaje } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };

      const entregas = await EntregaService.getEntregasByAgendaId(
        id_agenda_viaje,
        options
      );

      res.status(200).json(entregas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedEntrega = await EntregaService.updateEntrega(id, data);
      res.status(200).json(updatedEntrega);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await EntregaService.deleteEntrega(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new EntregaController();

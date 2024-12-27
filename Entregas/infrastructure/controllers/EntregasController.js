import EntregaService from "../../application/EntregaService.js";

class EntregaController {
  async createEntrega(req, res) {
    try {
      const { detalles, rut, fechaHoraEntrega } = req.body;

      // Crear la entrega
      const result = await EntregaService.createEntrega(
        detalles,
        rut,
        fechaHoraEntrega
      );

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
      const entregas = await EntregaService.getAllEntregas();
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

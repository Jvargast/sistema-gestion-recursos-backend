import AgendaCargaService from "../../application/AgendaCargaService.js";

class AgendaCargaController {
    async create(req, res) {
      try {
        const { fecha_hora, rut, detalles, productosAdicionales, id_camion } = req.body;
        const agenda = await AgendaCargaService.createAgenda(fecha_hora, rut, detalles, productosAdicionales, id_camion);
        res.status(201).json(agenda);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  
    async getById(req, res) {
      try {
        const { id } = req.params;
        const agenda = await AgendaCargaService.getAgendaById(id);
        res.status(200).json(agenda);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    }
  
    async getAll(req, res) {
      try {
        const agendas = await AgendaCargaService.getAllAgendas();
        res.status(200).json(agendas);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  
    async update(req, res) {
      try {
        const { id } = req.params;
        const data = req.body;
        const updatedAgenda = await AgendaCargaService.updateAgenda(id, data);
        res.status(200).json(updatedAgenda);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  
    async delete(req, res) {
      try {
        const { id } = req.params;
        await AgendaCargaService.deleteAgenda(id);
        res.status(204).send();
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
  
  export default new AgendaCargaController();
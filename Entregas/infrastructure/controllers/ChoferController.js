import AgendaViajeService from "../../application/AgendaViajeService.js";

class ChoferController {
    async getChoferesDisponibles(req, res) {
      try {
        const choferes = await AgendaViajeService.getAllViajes();
        res.status(200).json(choferes);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    }
  }
  
  export default new ChoferController();

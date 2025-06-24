import AgendaViajeService from "../../application/AgendaViajeService.js";

class AgendaViajesController {
  async getAllViajes(req, res) {
    try {
      const viajes = await AgendaViajeService.getAllViajes();
      res.status(200).json(viajes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getViajeChofer(req, res) {
    try {
      const { id_chofer } = req.params;
      const viaje = await AgendaViajeService.getViajeByChoferId(id_chofer);
      res.status(200).json(viaje);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async finalizarViaje(req, res) {
    try {
      const { id_agenda_viaje } = req.params;
      const {
        descargarAuto,
        descargarDisponibles,
        dejaRetornablesEnPlanta,
      } = req.body;

      const choferRut = req.user ? req.user.id : null;

      const result = await AgendaViajeService.finalizarViaje(
        id_agenda_viaje,
        choferRut,
        {
          descargarAuto,
          descargarDisponibles,
          dejaRetornablesEnPlanta,
        }
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistorialViajesChofer(req, res) {
    try {
      const { id_chofer } = req.params;

      const viajes = await AgendaViajeService.getHistorialViajesChofer(
        id_chofer
      );

      res.status(200).json({ success: true, data: viajes });
    } catch (error) {
      console.error("Error al obtener historial de viajes:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener historial de viajes.",
      });
    }
  }

  async getHistorialViajes(req, res) {
    try {
      const viajes = await AgendaViajeService.getHistorialViajes();
      res.status(200).json(viajes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AgendaViajesController();

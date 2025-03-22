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
      const { descargarDisponibles } = req.body;
      const choferRut = req.user ? req.user.id : null;

      const result = await AgendaViajeService.finalizarViaje(
        id_agenda_viaje,
        choferRut,
        descargarDisponibles
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /* Opcionalmente, podrías agregar otros endpoints, por ejemplo:
  async iniciarViaje(req, res) {
    try {
      const { id_agenda_carga } = req.params;
      const choferRut = req.user ? req.user.rut : null;
      const result = await AgendaViajesService.iniciarViaje(id_agenda_carga, choferRut);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } */
}

export default new AgendaViajesController();

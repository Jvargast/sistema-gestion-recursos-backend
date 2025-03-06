import AgendaViajesRepository from "../infrastructure/repositories/AgendaViajesRepository.js";

class AgendaViajesService {
  async getAllViajes() {
    try {
      const choferesDisponibles = await AgendaViajesRepository.getChoferesEnTransito();

      const choferesConInventario = choferesDisponibles.filter(
        (chofer) => chofer.camion?.inventario?.length > 0
      );

      if (choferesConInventario.length === 0) {
        throw new Error("No hay choferes con inventario disponible en tránsito.");
      }

      return choferesConInventario;
    } catch (error) {
      console.error("Error en AgendaViajesService:", error);
      throw new Error(error.message);
    }
  }
}

export default new AgendaViajesService();

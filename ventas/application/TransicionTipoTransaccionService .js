import TransicionTipoTransaccionRepository from "../infrastructure/repositories/TransicionTipoTransaccionRepository.js";

class TransicionTipoTransaccionService {
  async validarTransicion(tipoOrigen, estadoOrigen, tipoDestino, estadoDestino) {

    const transicion = await TransicionTipoTransaccionRepository.findByTransition(
      tipoOrigen,
      estadoOrigen,
      tipoDestino,
      estadoDestino
    );

    if (!transicion) {
      throw new Error(
        `Transición no válida: ${tipoOrigen} (${estadoOrigen}) → ${tipoDestino} (${estadoDestino})`
      );
    }

    return true;
  }
}

export default new TransicionTipoTransaccionService();

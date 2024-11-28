import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";

class MetodoPagoService {
  async getMetodoPagoById(id_metodo_pago) {
    return await MetodoPagoRepository.findById(id_metodo_pago);
  }
}

export default new MetodoPagoService();

import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";

class MetodoPagoService {
  async getMetodoPagoById(id_metodo_pago) {
    return await MetodoPagoRepository.findById(id_metodo_pago);
  }

  async getMetodoByConditions(conditions) {
    return await MetodoPagoRepository.findAllWithConditions(conditions);
  }
}

export default new MetodoPagoService();

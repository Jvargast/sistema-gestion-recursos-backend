import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";

class MetodoPagoService {
  async getMetodoPagoById(id_metodo_pago) {
    return await MetodoPagoRepository.findById(id_metodo_pago);
  }

  async getMetodoByConditions(conditions) {
    return await MetodoPagoRepository.findAllWithConditions(conditions);
  }

  async getMetodoByNombre(nombre) {
    const metodo = await MetodoPagoRepository.findByNombre(nombre);
    if (!metodo) throw new Error('Metodo no encontrado.');
    return metodo;
  }

  async getMetodosPago() {
    return await MetodoPagoRepository.findAll();
  }
}

export default new MetodoPagoService();

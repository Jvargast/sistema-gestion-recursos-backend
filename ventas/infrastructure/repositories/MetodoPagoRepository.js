import IMetodoPagoRepository from "../../domain/repositories/IMetodoPagoRepository.js";
import MetodoPago from "../../domain/models/MetodoPago.js";

class MetodoPagoRepository extends IMetodoPagoRepository {
  async findById(id) {
    return await MetodoPago.findByPk(id);
  }

  async findAll() {
    return await MetodoPago.findAll();
  }
}

export default new MetodoPagoRepository();

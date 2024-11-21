import IEstadoPagoRepository from "../../domain/repositories/IEstadoPagoRepository.js";
import EstadoPago from "../../domain/models/EstadoPago.js";

class EstadoPagoRepository extends IEstadoPagoRepository {
  async findById(id) {
    return await EstadoPago.findByPk(id);
  }

  async findAll() {
    return await EstadoPago.findAll();
  }
}

export default new EstadoPagoRepository();

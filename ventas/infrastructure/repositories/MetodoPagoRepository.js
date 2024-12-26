import IMetodoPagoRepository from "../../domain/repositories/IMetodoPagoRepository.js";
import MetodoPago from "../../domain/models/MetodoPago.js";

class MetodoPagoRepository extends IMetodoPagoRepository {
  async findById(id) {
    return await MetodoPago.findByPk(id);
  }

  async findAll() {
    return await MetodoPago.findAll();
  }

  async findAllWithConditions(conditions) {
    return await MetodoPago.findAll({ where: conditions });
  }

  async findByNombre(nombre) {
    return await MetodoPago.findOne({ where: { nombre: nombre } });
  }

  getModel() {
    return MetodoPago;
  }
}

export default new MetodoPagoRepository();

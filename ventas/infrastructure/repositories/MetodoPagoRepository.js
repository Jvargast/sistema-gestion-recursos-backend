import MetodoPago from "../../domain/models/MetodoPago.js";

class MetodoPagoRepository {
  async findById(id, options = {}) {
    return await MetodoPago.findByPk(id, options);
  }

  async findAll(options = {}) {
    return await MetodoPago.findAll(options);
  }

  async findAllWithConditions(conditions, options = {}) {
    return await MetodoPago.findAll({ where: conditions, ...options });
  }

  async findByNombre(nombre, options = {}) {
    return await MetodoPago.findOne({ where: { nombre: nombre }, ...options });
  }

  getModel() {
    return MetodoPago;
  }
}

export default new MetodoPagoRepository();

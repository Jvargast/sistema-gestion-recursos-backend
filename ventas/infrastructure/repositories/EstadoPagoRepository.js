import EstadoPago from "../../domain/models/EstadoPago.js";

class EstadoPagoRepository  {
  async findAll(options = {}) {
    return await EstadoPago.findAll(options);
  }

  async findByNombre(nombre, options = {}) {
    return await EstadoPago.findOne({
      where: { nombre },
      ...options,
    });
  }

  async findById(id_estado_pago, options = {}) {
    return await EstadoPago.findByPk(id_estado_pago, options);
  }

  async create(data, options = {}) {
    return await EstadoPago.create(data, options);
  }

  async update(id_estado_pago, data, options = {}) {
    const estado = await EstadoPago.findByPk(id_estado_pago, options);
    if (!estado) {
      throw new Error(`Estado de pago con ID ${id_estado_pago} no encontrado.`);
    }

    Object.assign(estado, data);
    await estado.save(options);
    return estado;
  }

  async delete(id_estado_pago, options = {}) {
    const estado = await EstadoPago.findByPk(id_estado_pago, options);
    if (!estado) {
      throw new Error(`Estado de pago con ID ${id_estado_pago} no encontrado.`);
    }

    await estado.destroy(options);
    return true;
  }

  getModel() {
    return EstadoPago;
  } 
}

export default new EstadoPagoRepository();

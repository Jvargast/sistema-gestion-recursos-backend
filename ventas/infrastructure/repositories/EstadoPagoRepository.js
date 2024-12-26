import IEstadoPagoRepository from "../../domain/repositories/IEstadoPagoRepository.js";
import EstadoPago from "../../domain/models/EstadoPago.js";

class EstadoPagoRepository extends IEstadoPagoRepository {
  async findAll() {
    return await EstadoPago.findAll();
  }

  async findByNombre(nombre) {
    return await EstadoPago.findOne({
      where: { nombre },
    });
  }

  async findById(id_estado_pago) {
    return await EstadoPago.findByPk(id_estado_pago);
  }

  async create(data) {
    return await EstadoPago.create(data);
  }

  async update(id_estado_pago, data) {
    const estado = await EstadoPago.findByPk(id_estado_pago);
    if (!estado) {
      throw new Error(`Estado de pago con ID ${id_estado_pago} no encontrado.`);
    }

    Object.assign(estado, data);
    await estado.save();
    return estado;
  }

  async delete(id_estado_pago) {
    const estado = await EstadoPago.findByPk(id_estado_pago);
    if (!estado) {
      throw new Error(`Estado de pago con ID ${id_estado_pago} no encontrado.`);
    }

    await estado.destroy();
    return true;
  }

  getModel() {
    return EstadoPago;
  } 
}

export default new EstadoPagoRepository();

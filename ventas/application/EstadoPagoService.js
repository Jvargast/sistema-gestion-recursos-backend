import EstadoPagoRepository from "../infrastructure/repositories/EstadoPagoRepository.js";

class EstadoPagoService {
  async getAllEstadosPago() {
    return await EstadoPagoRepository.findAll();
  }

  async findByNombre(nombre) {
    const estado = await EstadoPagoRepository.findByNombre(nombre);
    if (!estado) {
      throw new Error(`Estado de pago con el nombre "${nombre}" no encontrado.`);
    }
    return estado;
  }

  async findById(id_estado_pago) {
    const estado = await EstadoPagoRepository.findById(id_estado_pago);
    if (!estado) {
      throw new Error(`Estado de pago con ID ${id_estado_pago} no encontrado.`);
    }
    return estado;
  }

  async createEstadoPago(data) {
    const existingEstado = await EstadoPagoRepository.findByNombre(data.nombre);
    if (existingEstado) {
      throw new Error(
        `El estado de pago con el nombre "${data.nombre}" ya existe.`
      );
    }
    return await EstadoPagoRepository.create(data);
  }

  async updateEstadoPago(id_estado_pago, data) {
    const updatedEstado = await EstadoPagoRepository.update(id_estado_pago, data);
    if (!updatedEstado) {
      throw new Error(`No se pudo actualizar el estado de pago con ID ${id_estado_pago}.`);
    }
    return updatedEstado;
  }

  async deleteEstadoPago(id_estado_pago) {
    const deleted = await EstadoPagoRepository.delete(id_estado_pago);
    if (!deleted) {
      throw new Error(`No se pudo eliminar el estado de pago con ID ${id_estado_pago}.`);
    }
    return { message: "Estado de pago eliminado con éxito." };
  }
}

export default new EstadoPagoService();

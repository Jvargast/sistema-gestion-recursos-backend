import IEstadoDetalleTransaccionRepository from "../../domain/repositories/IEstadoDetalleTransaccionRepository.js";
import EstadoDetalleTransaccion from "../../domain/models/EstadoDetalleTransaccion.js";

class EstadoDetalleTransaccionRepository extends IEstadoDetalleTransaccionRepository {
  async findById(id) {
    return await EstadoDetalleTransaccion.findByPk(id);
  }

  async findAll() {
    return await EstadoDetalleTransaccion.findAll();
  }

  async findByNombre(nombre) {
    return await EstadoDetalleTransaccion.findOne({
      where: { nombre_estado: nombre },
    });
  }

  async create(data) {
    return await EstadoDetalleTransaccion.create(data);
  }

  async update(id, data) {
    return await EstadoDetalleTransaccion.update(data, {
      where: { id_estado_transaccion: id },
    });
  }

  async delete(id) {
    return await EstadoDetalleTransaccion.destroy({
      where: { id_estado_transaccion: id },
    });
  }
}

export default new EstadoDetalleTransaccionRepository();

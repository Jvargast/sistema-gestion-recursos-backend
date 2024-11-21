import IEstadoTransaccionRepository from "../../domain/repositories/IEstadoTransaccionRepository.js";
import EstadoTransaccion from "../../domain/models/EstadoTransaccion.js";

class EstadoTransaccionRepository extends IEstadoTransaccionRepository {
  async findById(id) {
    return await EstadoTransaccion.findByPk(id);
  }

  async findAll() {
    return await EstadoTransaccion.findAll();
  }

  async findByNombre(nombre) {
    return await EstadoTransaccion.findOne({
      where: { nombre_estado: nombre },
    });
  }

  async create(data) {
    return await EstadoTransaccion.create(data);
  }

  async update(id, data) {
    return await EstadoTransaccion.update(data, {
      where: { id_estado_transaccion: id },
    });
  }

  async delete(id) {
    return await EstadoTransaccion.destroy({
      where: { id_estado_transaccion: id },
    });
  }
}

export default new EstadoTransaccionRepository();

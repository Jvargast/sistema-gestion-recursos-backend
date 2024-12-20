import IEstadoTransaccionRepository from "../../domain/repositories/IEstadoTransaccionRepository.js";
import EstadoTransaccion from "../../domain/models/EstadoTransaccion.js";

class EstadoTransaccionRepository extends IEstadoTransaccionRepository {
  async findById(id) {
    return await EstadoTransaccion.findByPk(id);
  }

  async findAll(options = {}) {
    return await EstadoTransaccion.findAll({
      ...options, // Inserta las opciones dinámicas
    });
  }

  async findByNombre(nombre) {
    return await EstadoTransaccion.findOne({
      where: { nombre_estado: nombre },
    });
  }

  async findByTipoTransaccion(tipo_transaccion) {
    return await EstadoTransaccion.findOne({
      where: {
        tipo_transaccion: tipo_transaccion,
        es_inicial: true
      }
    })
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
  getModel() {
    return EstadoTransaccion;
  }
}

export default new EstadoTransaccionRepository();

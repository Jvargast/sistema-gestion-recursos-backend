import IEstadoFacturaRepository from "../../domain/repositories/IEstadoFacturaRepository.js";
import EstadoFactura from "../../domain/models/EstadoFactura.js";

class EstadoFacturaRepository extends IEstadoFacturaRepository {
  async findById(id) {
    return await EstadoFactura.findByPk(id);
  }

  async findAll() {
    return await EstadoFactura.findAll();
  }

  async findByNombre(nombre) {
    return await EstadoFactura.findOne({
      where: { nombre: nombre },
    });
  }

  async create(data) {
    return await EstadoFactura.create(data);
  }

  async update(id, data) {
    return await EstadoFactura.update(data, {
      where: { id_estado_transaccion: id },
    });
  }

  async delete(id) {
    return await EstadoFactura.destroy({
      where: { id_estado_transaccion: id },
    });
  }

  getModel() {
    return EstadoFactura;
  }
}

export default new EstadoFacturaRepository();

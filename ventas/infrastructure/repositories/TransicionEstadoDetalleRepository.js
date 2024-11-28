import TransicionEstadoDetalle from "../../domain/models/TransicionEstadoDetalle.js";
import ITransicionEstadoDetalleRepository from "../../domain/repositories/ITransicionEstadoDetalleRepository.js";

class TransicionEstadoTransaccionRepository extends ITransicionEstadoDetalleRepository {
  async findAll() {
    return await TransicionEstadoDetalle.findAll();
  }

  async findByStates(estadoOrigen, estadoDestino) {
    return await TransicionEstadoDetalle.findOne({
      where: { id_estado_origen: estadoOrigen, id_estado_destino: estadoDestino },
    });
  }

  async findByOrigen(estadoOrigen) {
    return await TransicionEstadoDetalle.findAll({
      where: { estado_origen: estadoOrigen },
    });
  }

  async findByDestino(estadoDestino) {
    return await TransicionEstadoDetalle.findAll({
      where: { estado_destino: estadoDestino },
    });
  }

  async create(data) {
    return await TransicionEstadoDetalle.create(data);
  }

  async deleteById(idTransicion) {
    return await TransicionEstadoDetalle.destroy({
      where: { id: idTransicion },
    });
  }

  async updateById(idTransicion, data) {
    return await TransicionEstadoTransaccion.update(data, {
      where: { id: idTransicion },
    });
  }
}

export default new TransicionEstadoTransaccionRepository();
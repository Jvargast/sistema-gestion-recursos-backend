import TransicionEstadoTransaccion from "../../domain/models/TransicionEstadoTransaccion.js";
import ITransicionEstadoTransaccionRepository from "../../domain/repositories/ITransicionEstadoTransaccionRepository.js";

class TransicionEstadoTransaccionRepository extends ITransicionEstadoTransaccionRepository {
  async findAll() {
    return await TransicionEstadoTransaccion.findAll();
  }

  async findByStates(estadoOrigen, estadoDestino) {
    return await TransicionEstadoTransaccion.findOne({
      where: { id_estado_origen: estadoOrigen, id_estado_destino: estadoDestino },
    });
  }

  async findByOrigen(estadoOrigen) {
    return await TransicionEstadoTransaccion.findAll({
      where: { id_estado_origen: estadoOrigen },
    });
  }

  async findByDestino(estadoDestino) {
    return await TransicionEstadoTransaccion.findAll({
      where: { id_estado_destino: estadoDestino },
    });
  }

  async create(data) {
    return await TransicionEstadoTransaccion.create(data);
  }

  async deleteById(idTransicion) {
    return await TransicionEstadoTransaccion.destroy({
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

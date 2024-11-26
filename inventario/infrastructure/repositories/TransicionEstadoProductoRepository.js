import TransicionEstadoProducto from "../../domain/models/TransicionEstadoProducto.js";
import ITransicionEstadoProductoRepository from "../../domain/repositories/ITransicionEstadoProductoRepository.js";

class TransicionEstadoProductoRepository extends ITransicionEstadoProductoRepository {
  async findAll() {
    return await TransicionEstadoProducto.findAll();
  }

  async findByStates(estadoOrigen, estadoDestino) {
    return await TransicionEstadoProducto.findOne({
      where: { estado_origen: estadoOrigen, estado_destino: estadoDestino },
    });
  }

  async findByOrigen(estadoOrigen) {
    return await TransicionEstadoProducto.findAll({
      where: { estado_origen: estadoOrigen },
    });
  }

  async findByDestino(estadoDestino) {
    return await TransicionEstadoProducto.findAll({
      where: { estado_destino: estadoDestino },
    });
  }

  async create(data) {
    return await TransicionEstadoProducto.create(data);
  }

  async deleteById(idTransicion) {
    return await TransicionEstadoProducto.destroy({
      where: { id: idTransicion },
    });
  }

  async updateById(idTransicion, data) {
    return await TransicionEstadoProducto.update(data, {
      where: { id: idTransicion },
    });
  }
}

export default new TransicionEstadoProductoRepository();

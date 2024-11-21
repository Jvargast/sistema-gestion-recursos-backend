import ILogTransaccionRepository from "../../domain/repositories/ILogTransaccionRepository.js";
import LogTransaccion from "../../domain/models/LogTransaccion.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

class LogTransaccionRepository extends ILogTransaccionRepository {
  async findByTransaccionId(transaccionId) {
    return await LogTransaccion.findAll({
      where: { id_transaccion: transaccionId },
      include: { model: Usuarios, as: "usuario" },
    });
  }

  async create(data) {
    return await LogTransaccion.create(data);
  }

  async bulkCreate(logs) {
    return await LogTransaccion.bulkCreate(logs);
  }

  async findAll() {
    return await LogTransaccion.findAll();
  }

  getModel() {
    return LogTransaccion;
  }
}

export default new LogTransaccionRepository();

import LogTransaccionRepository from "../infrastructure/repositories/LogTransaccionRepository.js";
import paginate from "../../shared/utils/pagination.js";

class LogTransaccionService {
  async createLog(data) {
    const { id_transaccion, id_usuario, accion, detalles, estado } = data;
    if (!id_transaccion || !id_usuario || !accion) {
      throw new Error("Faltan campos obligatorios para crear el log.");
    }
    
    return await LogTransaccionRepository.create({
      id_transaccion,
      id_usuario,
      accion,
      estado,
      detalles,
    });
  }

  async createBulkLogs(logs) {
    if (!Array.isArray(logs) || logs.length === 0) {
      throw new Error("Debe proporcionar una lista de logs válida.");
    }

    logs.forEach((log) => {
      if (!log.id_transaccion || !log.id_usuario || !log.accion) {
        throw new Error("Faltan campos obligatorios en uno o más logs.");
      }

      log.fecha_creacion = new Date();
    });

    return await LogTransaccionRepository.bulkCreate(logs);
  }

  async getLogsByTransaccion(id_transaccion) {
    if (!id_transaccion) {
      throw new Error("El ID de la transacción es obligatorio.");
    }

    return await LogTransaccionRepository.findByTransaccionId(id_transaccion);
  }

  async getAllLogs(options = {}) {
    return await paginate(LogTransaccionRepository.getModel(), options);
  }
}

export default new LogTransaccionService();

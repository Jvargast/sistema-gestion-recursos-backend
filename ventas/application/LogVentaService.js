import paginate from "../../shared/utils/pagination.js";
import LogVentaRepository from "../infrastructure/repositories/LogVentaRepository.js";

class LogTransaccionService {
  async createLog(data) {
    const { id_log, id_usuario, accion, detalles, estado } = data;
    if (!id_log || !id_usuario || !accion) {
      throw new Error("Faltan campos obligatorios para crear el log.");
    }

    return await LogVentaRepository.create({
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

    return await LogVentaRepository.bulkCreate(logs);
  }

  async getLogsByTransaccion(id_transaccion) {
    if (!id_transaccion) {
      throw new Error("El ID de la transacción es obligatorio.");
    }

    return await LogVentaRepository.findByTransaccionId(id_transaccion);
  }

  async getAllLogs(filters = {}, options) {
    const result = await paginate(LogVentaRepository.getModel(), options, {
      order: [["id_log", "ASC"]],
    });
    return result;
  }
}

export default new LogTransaccionService();

import InventarioLog from "../../domain/models/InventarioLogs";

class LogRepository {
  // Crear 
  async createLog(data) {
    return await InventarioLog.create(data);
  }
}

export default new LogRepository();

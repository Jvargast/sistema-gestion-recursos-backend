import InventarioLog from "../../domain/models/InventarioLogs.js";

class LogRepository {
  async createLog(data) {
    return await InventarioLog.create(data);
  }
}

export default new LogRepository();

import InventarioCamionLogs from "../../domain/models/InventarioCamionLogs.js";

class InventarioCamionLogsRepository {
  async create(data, options = {}) {
    return await InventarioCamionLogs.create(data, options);
  }
}

export default new InventarioCamionLogsRepository();

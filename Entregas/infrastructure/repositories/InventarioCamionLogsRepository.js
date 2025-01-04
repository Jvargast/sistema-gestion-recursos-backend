import InventarioCamionLogs from "../../domain/models/InventarioCamionLogs.js";

class InventarioCamionLogsRepository {
  async create(data) {
    return await InventarioCamionLogs.create(data);
  }
}

export default new InventarioCamionLogsRepository();

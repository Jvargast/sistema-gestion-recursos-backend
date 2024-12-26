import AuditLogs from "../../domain/models/AuditLogs.js";

class AuditLogsRepository {
  static async createLog(data) {
    try {
      const log = await AuditLogs.create(data);
      return log;
    } catch (error) {
      console.error("Error creating audit log:", error);
      throw error;
    }
  }

  static async getLogsByUser(userId) {
    try {
      return await AuditLogs.findAll({ where: { userId } });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  }

  static async getAllLogs() {
    try {
      return await AuditLogs.findAll();
    } catch (error) {
      console.error("Error fetching all logs:", error);
      throw error;
    }
  }

  static getModel() {
    return AuditLogs;
  }
}

export default AuditLogsRepository;

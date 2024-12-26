import paginate from "../../shared/utils/pagination.js";
import AuditLogsRepository from "../infraestructure/repositories/AuditLogsRepository.js";

class AuditLogsService {
  static async logAction(userId, action, module, ip_address) {
    try {
      const logData = {
        userId,
        action,
        module,
        ip_address,
      };
      return await AuditLogsRepository.createLog(logData);
    } catch (error) {
      console.error("Error logging action:", error);
      throw error;
    }
  }

  static async getUserLogs(userId) {
    try {
      return await AuditLogsRepository.getLogsByUser(userId);
    } catch (error) {
      console.error("Error fetching user logs:", error);
      throw error;
    }
  }

  static async getAllLogs(filters = {}, options) {
    try {
      const result = await paginate(AuditLogsRepository.getModel(), options, {
        order: [["id", "ASC"]],
      });
      return result;
    } catch (error) {
      console.error("Error fetching all logs:", error);
      throw error;
    }
  }
}

export default AuditLogsService;

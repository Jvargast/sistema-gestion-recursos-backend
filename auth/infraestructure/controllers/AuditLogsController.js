import AuditLogsService from "../../application/AuditLogsService.js";

class AuditLogsController {
  async createLog(req, res) {
    try {
      const { userId, action, module } = req.body;
      const ip_address = req.ip;

      const log = await AuditLogsService.logAction(
        userId,
        action,
        module,
        ip_address
      );

      return res.status(201).json(log);
    } catch (error) {
      return res.status(500).json({ error: "Error creating audit log." });
    }
  }

  async getLogs(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
        pageSize: parseInt(req.query.pageSize),
      };
      delete filters.limit;
      delete filters.offset;
      
      const auditLogs = await AuditLogsService.getAllLogs(filters, options);
      return res
        .status(200)
        .json({ data: auditLogs.data, total: auditLogs.pagination });
    } catch (error) {
      return res.status(500).json({ error: "Error fetching audit logs." });
    }
  }
}

export default new AuditLogsController();

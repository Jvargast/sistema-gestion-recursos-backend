import LogVentaService from "../../application/LogVentaService.js";

class LogVentaController {
  async getLogsByTransaccion(req, res) {
    try {
      const { id_transaccion } = req.params;
      const logs = await LogVentaService.getLogsByTransaccion(
        id_transaccion
      );
      res.status(200).json(logs);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllLogs(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
        pageSize: parseInt(req.query.pageSize)
      };
      delete filters.limit;
      delete filters.offset;
      const logs = await LogVentaService.getAllLogs(filters, options);
      res.status(200).json({ data: logs.data, total: logs.pagination });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createLog(req, res) {
    try {
      const log = await LogTransaccionService.createLog(req.body);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new LogVentaController();

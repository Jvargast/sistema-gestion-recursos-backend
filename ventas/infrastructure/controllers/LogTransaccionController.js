import LogTransaccionService from "../../application/LogTransaccionService.js";

class LogTransaccionController {
  async getLogsByTransaccion(req, res) {
    try {
      const { id_transaccion } = req.params;
      const logs = await LogTransaccionService.getLogsByTransaccion(id_transaccion);
      res.status(200).json(logs);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllLogs(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      };
      const logs = await LogTransaccionService.getAllLogs(options);
      res.status(200).json(logs);
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

export default new LogTransaccionController();

import TipoInsumoService from '../../application/TipoInsumoService.js';

class TipoInsumoController {
  async getTipoById(req, res) {
    try {
      const tipo = await TipoInsumoService.getTipoById(req.params.id);
      res.status(200).json(tipo);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllTipos(req, res) {
    try {
      const tipos = await TipoInsumoService.getAllTipos();
      res.status(200).json(tipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTipo(req, res) {
    try {
      const tipo = await TipoInsumoService.createTipo(req.body);
      res.status(201).json(tipo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateTipo(req, res) {
    try {
      const tipo = await TipoInsumoService.updateTipo(req.params.id, req.body);
      res.status(200).json(tipo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTipo(req, res) {
    try {
      await TipoInsumoService.deleteTipo(req.params.id);
      res.status(200).json({ message: 'Tipo eliminado con éxito' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new TipoInsumoController();

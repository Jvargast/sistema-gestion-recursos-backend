import TipoProductoService from '../../application/TipoProductoService.js';

class TipoProductoController {
  async getTipoById(req, res) {
    try {
      const tipo = await TipoProductoService.getTipoById(req.params.id);
      res.status(200).json(tipo);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllTipos(req, res) {
    try {
      const tipos = await TipoProductoService.getAllTipos();
      res.status(200).json(tipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTipo(req, res) {
    try {
      const tipo = await TipoProductoService.createTipo(req.body);
      res.status(201).json(tipo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateTipo(req, res) {
    try {
      const tipo = await TipoProductoService.updateTipo(req.params.id, req.body);
      res.status(200).json(tipo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTipo(req, res) {
    try {
      await TipoProductoService.deleteTipo(req.params.id);
      res.status(200).json({ message: 'Tipo eliminado con éxito' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new TipoProductoController();

import EstadoProductoService from '../../application/EstadoProductoService.js';

class EstadoProductoController {
  async getEstadoById(req, res) {
    try {
      const estado = await EstadoProductoService.getEstadoById(req.params.id);
      res.status(200).json(estado);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllEstados(req, res) {
    try {
      const estados = await EstadoProductoService.getAllEstados();
      res.status(200).json(estados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createEstado(req, res) {
    try {
      const estado = await EstadoProductoService.createEstado(req.body);
      res.status(201).json(estado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEstado(req, res) {
    try {
      const estado = await EstadoProductoService.updateEstado(req.params.id, req.body);
      res.status(200).json(estado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEstado(req, res) {
    try {
      await EstadoProductoService.deleteEstado(req.params.id);
      res.status(200).json({ message: 'Estado eliminado con éxito' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new EstadoProductoController();

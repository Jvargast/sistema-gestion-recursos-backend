import CategoriaProductoService from '../../application/CategoriaProductoService.js';

class CategoriaProductoController {
  async getCategoriaById(req, res) {
    try {
      const categoria = await CategoriaProductoService.getCategoriaById(req.params.id);
      res.status(200).json(categoria);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllCategorias(req, res) {
    try {
      const categorias = await CategoriaProductoService.getAllCategorias();
      res.status(200).json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCategoria(req, res) {
    try {
      const categoria = await CategoriaProductoService.createCategoria(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCategoria(req, res) {
    try {
      const categoria = await CategoriaProductoService.updateCategoria(req.params.id, req.body);
      res.status(200).json(categoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCategoria(req, res) {
    try {
      await CategoriaProductoService.deleteCategoria(req.params.id);
      res.status(200).json({ message: 'Categoría eliminada con éxito' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CategoriaProductoController();

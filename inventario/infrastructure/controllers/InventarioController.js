import InventarioService from '../../application/InventarioService.js';

class InventarioController {
  async getInventarioByProductoId(req, res) {
    try {
      const inventario = await InventarioService.getInventarioByProductoId(req.params.id_producto);
      res.status(200).json(inventario);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllInventarios(req, res) {
    try {
      const inventarios = await InventarioService.getAllInventarios();
      res.status(200).json(inventarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createInventario(req, res) {
    try {
      const inventario = await InventarioService.createInventario(req.body);
      res.status(201).json(inventario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateInventario(req, res) {
    try {
      const inventario = await InventarioService.updateInventario(req.params.id_producto, req.body);
      res.status(200).json(inventario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteInventario(req, res) {
    try {
      await InventarioService.deleteInventario(req.params.id_producto);
      res.status(200).json({ message: 'Inventario eliminado con éxito' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new InventarioController();

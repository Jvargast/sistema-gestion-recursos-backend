import InventarioCamionService from "../../application/InventarioCamionService.js";

class InventarioCamionController {
    async addProduct(req, res) {
      try {
        const data = req.body;
        const producto = await InventarioCamionService.addProductToCamion(data);
        res.status(201).json(producto);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  
    async getProductsByCamion(req, res) {
      try {
        const { id } = req.params;
        const productos = await InventarioCamionService.getProductsByCamion(id);
        res.status(200).json(productos);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    }
  
    async returnProducts(req, res) {
      try {
        const { id } = req.params;
        const result = await InventarioCamionService.retornarProductosAdicionales(id);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
  
  export default new InventarioCamionController();
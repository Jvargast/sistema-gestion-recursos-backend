import ProductoRetornableService from "../../application/ProductoRetornableService.js";

class ProductoRetornableController {
  async getProductoRetornableById(req, res) {
    try {
      const { id } = req.params;
      const productoRetornable = await ProductoRetornableService.getProductoRetornableById(id);
      res.status(200).json(productoRetornable);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllProductosRetornables(req, res) {
    try {
      const { filters, options } = req.body;
      const productosRetornables = await ProductoRetornableService.getAllProductosRetornables(filters, options);
      res.status(200).json(productosRetornables);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPendientes(req, res) {
    try {
      const pendientes = await ProductoRetornableService.getAllProductosRetornables({ estado: "pendiente_inspeccion" });
      res.status(200).json(pendientes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createProductoRetornable(req, res) {
    try {
      const data = req.body;
      const productoRetornable = await ProductoRetornableService.createProductoRetornable(data);
      res.status(201).json(productoRetornable);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProductoRetornable(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedProductoRetornable = await ProductoRetornableService.updateProductoRetornable(id, data);
      res.status(200).json(updatedProductoRetornable);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteProductoRetornable(req, res) {
    try {
      const { id } = req.params;
      await ProductoRetornableService.deleteProductoRetornable(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async inspeccionarRetornables(req, res) {
    try {
      const { id_camion } = req.params;
      const { items } = req.body;
      await ProductoRetornableService.inspeccionarRetornables(id_camion, items);
      res.status(200).json({ message: "Inspección completada" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ProductoRetornableController();

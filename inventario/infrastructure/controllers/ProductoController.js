import ProductoService from "../../application/ProductosService.js";

class ProductoController {
  async getProductoById(req, res) {
    try {
      const producto = await ProductoService.getProductoById(req.params.id);
      res.status(200).json(producto);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllProductos(req, res) {
    try {
      const filters = req.query;
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 20) || 20,
        search: req.query.search,
        tipo_producto: req.query.tipo_producto,
      };
      delete filters.limit;
      delete filters.offset;

      const productos = await ProductoService.getAllProductos(filters, options);

      res
        .status(200)
        .json({ data: productos.data, total: productos.pagination });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createProducto(req, res) {
    try {
      const producto = await ProductoService.createProducto(req.body);
      res.status(201).json(producto);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProducto(req, res) {
    try {
      const producto = await ProductoService.updateProducto(
        req.params.id,
        req.body
      );
      res.status(200).json(producto);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteProducto(req, res) {
    try {
      await ProductoService.deleteProducto(req.params.id);
      res.status(200).json({ message: "Producto eliminado con éxito" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteProductos(req, res) {
    try {
      const { ids } = req.body;
      const { rut } = req.user;
      const result = await ProductoService.deleteProductos(ids, rut);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProductosByTipo(req, res) {
    try {
      const productos = await ProductoService.getProductosByTipo(
        req.params.tipo
      );
      res.status(200).json(productos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAvailableProductos(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params

      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
        tipo_producto: req.query.tipo_producto
      };
      delete filters.limit;
      delete filters.offset;

      const productos = await ProductoService.getAvailableProductos(
        filters,
        options
      );

      res
        .status(200)
        .json({ data: productos.data, total: productos.pagination });
    } catch (error) {
      res.status(404).json({ error: error.message });

    }
  }
}

export default new ProductoController();

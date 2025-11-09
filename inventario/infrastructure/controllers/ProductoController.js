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
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        search: req.query.search,
        estado: req.query.estado,
        categoria: req.query.categoria,
        id_sucursal: req.query.id_sucursal,
      };
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
        req.body,
        req.file
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

  /*   async getAvailableProductos(req, res) {
    try {
      const filters = req.query;

      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
        categoria: req.query.categoria,
      };

      delete filters.limit;
      delete filters.offset;

      const productos = await ProductoService.getAvailableVendibles(
        filters,
        options
      );

      return res.status(200).json({
        data: productos.data,
        total: productos.pagination,
      });
    } catch (error) {
      console.error("Error al obtener productos e insumos:", error);
      return res.status(500).json({ error: error.message });
    }
  } */

  async getAvailableProductos(req, res) {
    try {
      const { id_sucursal, search, page, limit, orderBy, orderDir, categoria } =
        req.query;

      if (page || limit) {
        const p = Number(page) > 0 ? Number(page) : 1;
        const l = Number(limit) > 0 ? Number(limit) : 24;
        const offset = (p - 1) * l;

        const result = await ProductoService.getAvailableVendiblesPaged(
          {},
          {
            id_sucursal: Number(id_sucursal),
            search,
            limit: l,
            offset,
            orderBy,
            orderDir,
            categoria,
          }
        );
        return res.json(result);
      }

      const result = await ProductoService.getAvailableVendibles(
        { id_sucursal: Number(id_sucursal) },
        { search, categoria }
      );
      return res.json(result);
    } catch (e) {
      console.error("Error al obtener productos e insumos:", e);
      res.status(500).json({ error: "Error al obtener productos e insumos" });
    }
  }
}

export default new ProductoController();

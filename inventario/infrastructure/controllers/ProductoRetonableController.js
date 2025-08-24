import ProductoRetornableService from "../../application/ProductoRetornableService.js";

class ProductoRetornableController {
  async getProductoRetornableById(req, res) {
    try {
      const { id } = req.params;
      const productoRetornable =
        await ProductoRetornableService.getProductoRetornableById(id);
      res.status(200).json(productoRetornable);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllProductosRetornables(req, res) {
    try {
      const filters = { ...req.query };
      const productosRetornables =
        await ProductoRetornableService.getAllProductosRetornables(filters);
      res.status(200).json(productosRetornables);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPendientes(req, res) {
    try {
      const { id_sucursal_recepcion, search, page, limit } = req.query;
      const user = req.user;
      const isAdmin =
        (user?.rol && user.rol.toString().toLowerCase() === "administrador") ||
        (user?.rol?.nombre &&
          user.rol.nombre.toString().toLowerCase() === "administrador");

      const sucursal = isAdmin
        ? id_sucursal_recepcion
          ? Number(id_sucursal_recepcion)
          : null
        : user?.id_sucursal
        ? Number(user.id_sucursal)
        : null;

      if (!isAdmin && !sucursal) {
        return res
          .status(400)
          .json({ error: "No se pudo determinar la sucursal del usuario." });
      }

      const filters = { estado: "pendiente_inspeccion" };
      if (sucursal) filters.id_sucursal_recepcion = sucursal;

      const hasPagination =
        page != null &&
        limit != null &&
        !Number.isNaN(Number(page)) &&
        !Number.isNaN(Number(limit));

      if (!hasPagination) {
        const rows = await ProductoRetornableService.getAllProductosRetornables(
          filters,
          { search }
        );
        return res.status(200).json(rows);
      }

      const p = Math.max(1, Number(page));
      const l = Math.max(1, Number(limit));

      const result =
        await ProductoRetornableService.getAllProductosRetornablesPaginated(
          filters,
          { search, page: p, limit: l }
        );
      return res.status(200).json({
        data: result.rows,
        total: {
          items: result.count,
          page: p,
          limit: l,
          totalPages: Math.ceil(result.count / l),
        },
      });
      /*  const pendientes =
        await ProductoRetornableService.getAllProductosRetornables({
          estado: "pendiente_inspeccion",
        }); */
      /*  res.status(200).json(pendientes); */
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createProductoRetornable(req, res) {
    try {
      const data = req.body;
      const productoRetornable =
        await ProductoRetornableService.createProductoRetornable(data);
      res.status(201).json(productoRetornable);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProductoRetornable(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedProductoRetornable =
        await ProductoRetornableService.updateProductoRetornable(id, data);
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
      const { id_sucursal_inspeccion, items } = req.body || {};

      if (!id_sucursal_inspeccion) {
        return res
          .status(400)
          .json({ error: "id_sucursal_inspeccion es requerido" });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ error: "No hay items para inspeccionar." });
      }

      const result = await ProductoRetornableService.inspeccionarRetornables(
        Number(id_sucursal_inspeccion),
        items
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Error al inspeccionar:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ProductoRetornableController();

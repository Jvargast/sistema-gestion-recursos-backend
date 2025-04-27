import VentaService from "../../application/VentaService.js";

class VentaController {
  async createVenta(req, res) {
    try {
      const ventaData = req.body;
      const rut = req.user.id;
      const venta = await VentaService.createVenta(ventaData, rut);

      res.status(201).json({ message: "Venta creada exitosamente", venta });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getVentaById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ error: "El ID de la venta es obligatorio." });
      }

      const venta = await VentaService.getVentaById(id);
      if (!venta) {
        return res.status(404).json({ error: "Venta no encontrada" });
      }

      res.status(200).json(venta);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error interno del servidor: ${error.message}` });
    }
  }

  async getAllVentas(req, res) {
    try {
      const filters = req.query;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      };
      delete filters.page;
      delete filters.limit;

      const ventas = await VentaService.getAllVentas(filters, options);

      res.status(200).json({
        data: ventas.data,
        total: ventas.pagination,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async rejectVenta(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!id) {
        return res
          .status(400)
          .json({ error: "El ID de la venta es obligatorio." });
      }

      await VentaService.rejectVenta(id, user);

      return res.status(200).json({ message: "Venta rechazada exitosamente." });
    } catch (error) {
      console.error("Error al rechazar venta:", error);
      return res
        .status(400)
        .json({ error: error.message || "Error al rechazar venta." });
    }
  }

  async deleteVenta(req, res) {
    const { id } = req.params;
    const user = req.user;

    try {
      await VentaService.softDeleteVenta(id, user);
      return res
        .status(200)
        .json({ message: "Venta eliminada correctamente (soft delete)." });
    } catch (error) {
      console.error("Error al eliminar venta:", error);
      return res
        .status(400)
        .json({ error: error.message || "Error al eliminar venta." });
    }
  }
}

export default new VentaController();

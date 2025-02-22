import MovimientoCajaService from "../../application/MovimientoCajaService.js";

class MovimientoCajaController {
  async getByCajaIdAndDate(req, res) {
    try {
      const { id_caja } = req.params;
      let { fecha, page, limit } = req.query;

      if (!id_caja) {
        return res
          .status(400)
          .json({ error: "El ID de la caja es requerido." });
      }

      if (!fecha) {
        fecha = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
      }

      // Validar paginación
      page = parseInt(page, 10) || 1;
      limit = parseInt(limit, 10) || 10;

      const movimientos =
        await MovimientoCajaService.getMovimientosByCajaAndDate(
          id_caja,
          fecha,
          page,
          limit
        );

      if (!movimientos.data.length) {
        return res
          .status(404)
          .json({ message: "No se encontraron movimientos para esta fecha." });
      }

      res.status(200).json(movimientos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllMovimientos(req, res) {
    try {
      const { page = 1, limit = 10, search, fecha } = req.query; // Extraer parámetros
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
      };

      const filters = {};

      if (fecha) {
        filters.fecha_movimiento = fecha;
      }

      const movimientos = await MovimientoCajaService.getAllMovimientos(
        filters,
        options
      );

      res.status(200).json({
        data: movimientos.data,
        total: movimientos.pagination,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new MovimientoCajaController();

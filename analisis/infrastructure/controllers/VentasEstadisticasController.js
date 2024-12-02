import VentasEstadisticasService from "../../application/VentasEstadisticasService.js";

class VentasEstadisticasController {
  async obtenerPorAno(req, res) {
    try {
      const { year } = req.params;
      const estadisticas = await VentasEstadisticasService.obtenerPorAno(year);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Obtener estadísticas de ventas por año y mes
  async obtenerPorMes(req, res) {
    try {
      const { year, month } = req.params;
      const estadisticas = await VentasEstadisticasService.obtenerPorMes(
        year,
        month
      );
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Actualizar estadísticas de ventas manualmente
  async actualizarPorAno(req, res) {
    try {
      const { year } = req.body;
      const estadisticas = await VentasEstadisticasService.actualizarPorAno(
        year
      );
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  // Obtener estadísticas por ID
  async getEstadisticasPorId(req, res) {
    try {
      const { id } = req.params;
      const estadisticas =
        await VentasEstadisticasService.obtenerEstadisticasPorId(id);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Crear estadísticas
  async createEstadisticas(req, res) {
    try {
      const data = req.body;
      const estadisticas = await VentasEstadisticasService.crearEstadisticas(
        data
      );
      res.status(201).json(estadisticas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Actualizar estadísticas
  async updateEstadisticas(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const estadisticas =
        await VentasEstadisticasService.actualizarEstadisticas(id, data);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Calcular estadísticas para un año
  async calcularEstadisticasPorAno(req, res) {
    try {
      const { year } = req.body;
      const estadisticas =
        await VentasEstadisticasService.calcularEstadisticasPorAno(year);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Obtener todas las estadísticas con paginación
  async getAllEstadisticas(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const estadisticas =
        await VentasEstadisticasService.obtenerTodasEstadisticas({
          page,
          limit,
        });
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Eliminar estadísticas por ID
  async deleteEstadisticas(req, res) {
    try {
      const { id } = req.params;
      await VentasEstadisticasService.eliminarEstadisticasPorId(id);
      res.status(200).json({ message: "Estadísticas eliminadas con éxito." });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Monitorear ventas recientes
  async monitorearVentasRecientes(req, res) {
    try {
      const resultados =
        await VentasEstadisticasService.monitorearVentasRecientes();
      res.status(200).json(resultados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Actualizar estadísticas globales
  async actualizarEstadisticasGlobales(req, res) {
    try {
      await VentasEstadisticasService.actualizarEstadisticasGlobales();
      res
        .status(200)
        .json({ message: "Estadísticas globales actualizadas con éxito." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new VentasEstadisticasController();

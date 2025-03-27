import VentasEstadisticasService from "../../application/VentasEstadisticasService.js";

class VentasEstadisticasController {
  async generar(req, res) {
    try {
      const { fecha } = req.body;
      if (!fecha) {
        return res.status(400).json({ error: "Se requiere una fecha válida" });
      }
      const data = await VentasEstadisticasService.generarEstadisticasPorDia(
        fecha
      );
      return res.status(201).json(data);
    } catch (error) {
      console.error("Error al generar estadísticas de ventas:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerPorMes(req, res) {
    try {
      const { mes, anio } = req.query;
      const data = await VentasEstadisticasService.obtenerEstadisticasPorMes(
        mes,
        anio
      );
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener estadísticas de ventas:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerKpiDelDia(req, res) {
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const datos = await VentasEstadisticasService.obtenerKpiPorFecha(hoy);
      return res.status(200).json(datos);
    } catch (error) {
      console.error("Error al obtener KPI de ventas:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerResumenSemanal(req, res) {
    try {
      const datos = await VentasEstadisticasService.obtenerResumenSemanal();
      return res.status(200).json(datos);
    } catch (error) {
      console.error("Error al obtener resumen semana de ventas:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default new VentasEstadisticasController();

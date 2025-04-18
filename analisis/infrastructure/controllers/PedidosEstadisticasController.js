import PedidosEstadisticasService from "../../application/PedidosEstadisticasService.js";

class PedidosEstadisticasController {
  async generar(req, res) {
    try {
      const { fecha } = req.body;
      const data = await PedidosEstadisticasService.generarEstadisticasPorDia(
        fecha
      );
      return res.status(201).json(data);
    } catch (error) {
      console.error("Error al generar estadísticas de pedidos:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerPorMes(req, res) {
    try {
      const { mes, anio } = req.query;
      const data = await PedidosEstadisticasService.obtenerEstadisticasPorMes(
        mes,
        anio
      );
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener estadísticas de pedidos:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerKpiDelDia(req, res) {
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const datos = await PedidosEstadisticasService.obtenerKpiPorFecha(hoy);
      return res.status(200).json(datos);
    } catch (error) {
      console.error("Error al obtener KPI de pedidos:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default new PedidosEstadisticasController();

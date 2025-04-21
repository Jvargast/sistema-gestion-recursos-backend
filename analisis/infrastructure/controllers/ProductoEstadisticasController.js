import ProductoEstadisticasService from "../../application/ProductoEstadisticasService.js";

class ProductoEstadisticasController {
  async generar(req, res) {
    try {
      const { fecha } = req.body;
      const data = await ProductoEstadisticasService.generarEstadisticasPorDia(
        fecha
      );
      return res.status(201).json(data);
    } catch (error) {
      console.error(
        "Error al generar estadísticas de productos:",
        error.message
      );
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerPorMes(req, res) {
    try {
      const { mes, anio } = req.query;
      const data = await ProductoEstadisticasService.obtenerPorMesYAnio(
        mes,
        anio
      );
      return res.status(200).json(data);
    } catch (error) {
      console.error(
        "Error al obtener estadísticas de productos:",
        error.message
      );
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
  async obtenerKpiDelDia(req, res) {
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const data = await ProductoEstadisticasService.obtenerKpiPorFecha(hoy);
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener KPI de productos:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerResumenPorFecha(req, res) {
    try {
      const fecha = req.query.fecha;
      if (!fecha) {
        return res.status(400).json({ message: "La fecha es requerida" });
      }

      const resumen = await ProductoEstadisticasService.getResumenPorFecha(
        fecha
      );
      res.json(resumen);
    } catch (error) {
      console.error("Error en obtenerResumenPorFecha:", error.message);
      res
        .status(500)
        .json({ message: "Error al obtener resumen de productos" });
    }
  }
}

export default new ProductoEstadisticasController();

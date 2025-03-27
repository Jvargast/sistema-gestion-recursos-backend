import ProductoEstadisticasService from "../../application/ProductoEstadisticasService.js";

class ProductoEstadisticasController {
  async generar(req, res) {
    try {
      const { fecha } = req.body;
      const data = await ProductoEstadisticasService.generarEstadisticasPorDia(fecha);
      return res.status(201).json(data);
    } catch (error) {
      console.error("Error al generar estadísticas de productos:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerPorMes(req, res) {
    try {
      const { mes, anio } = req.query;
      const data = await ProductoEstadisticasService.obtenerPorMesYAnio(mes, anio);
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener estadísticas de productos:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default new ProductoEstadisticasController();

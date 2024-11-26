import ProductoEstadisticasService from "../application/ProductoEstadisticasService.js";
import VentasEstadisticasService from "../application/VentasEstadisticasService.js";

class EstadisticasController {
  async obtenerEstadisticasProducto(req, res) {
    const { id_producto } = req.params;
    const estadisticas = await ProductoEstadisticasService.obtenerEstadisticasProducto(id_producto);
    res.json(estadisticas);
  }

  async obtenerEstadisticasGlobales(req, res) {
    const estadisticas = await VentasEstadisticasService.obtenerEstadisticasGlobales();
    res.json(estadisticas);
  }
}

export default new EstadisticasController();

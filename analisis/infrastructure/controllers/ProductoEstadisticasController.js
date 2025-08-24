import {
  convertirFechaLocal,
  obtenerFechaActualChile,
} from "../../../shared/utils/fechaUtils.js";
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
      const { mes, anio, id_sucursal } = req.query;
      const data = await ProductoEstadisticasService.obtenerPorMesYAnio(
        mes,
        anio,
        { id_sucursal: id_sucursal ? Number(id_sucursal) : undefined }
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
      const { id_sucursal } = req.query;
      const hoy = obtenerFechaActualChile();
      const fecha = convertirFechaLocal(hoy, "YYYY-MM-DD");
      const data = await ProductoEstadisticasService.obtenerKpiPorFecha(fecha, {
        id_sucursal: id_sucursal ? Number(id_sucursal) : undefined,
      });
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener KPI de productos:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerResumenPorFecha(req, res) {
    try {
      const { fecha, id_sucursal } = req.query;
      if (!fecha) {
        return res.status(400).json({ message: "La fecha es requerida" });
      }

      const resumen = await ProductoEstadisticasService.getResumenPorFecha(
        fecha,
        { id_sucursal: id_sucursal ? Number(id_sucursal) : undefined }
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

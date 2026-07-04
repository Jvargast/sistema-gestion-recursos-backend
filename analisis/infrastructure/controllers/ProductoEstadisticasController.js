import {
  convertirFechaLocal,
  obtenerFechaActualChile,
} from "../../../shared/utils/fechaUtils.js";
import ProductoEstadisticasService from "../../application/ProductoEstadisticasService.js";
import { resolveSucursalFilter } from "./sucursalFilter.js";

class ProductoEstadisticasController {
  async generar(req, res) {
    try {
      const { fecha } = req.body;
      if (!fecha) {
        return res.status(400).json({ error: "Se requiere una fecha válida" });
      }
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
      const idSucursal = resolveSucursalFilter(req);
      const data = await ProductoEstadisticasService.obtenerPorMesYAnio(
        mes,
        anio,
        { id_sucursal: idSucursal }
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
      const idSucursal = resolveSucursalFilter(req);
      const hoy = obtenerFechaActualChile();
      const fecha = convertirFechaLocal(hoy, "YYYY-MM-DD");
      const data = await ProductoEstadisticasService.obtenerKpiPorFecha(fecha, {
        id_sucursal: idSucursal,
      });
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener KPI de productos:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerResumenPorFecha(req, res) {
    try {
      const { fecha } = req.query;
      const idSucursal = resolveSucursalFilter(req);
      if (!fecha) {
        return res.status(400).json({ message: "La fecha es requerida" });
      }

      const resumen = await ProductoEstadisticasService.getResumenPorFecha(
        fecha,
        { id_sucursal: idSucursal }
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

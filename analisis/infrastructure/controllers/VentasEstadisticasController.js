import { obtenerFechaActualChile } from "../../../shared/utils/fechaUtils.js";
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
      const hoy = obtenerFechaActualChile();
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
      console.error(
        "Error al obtener resumen semana de ventas:",
        error.message
      );
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async obtenerTendenciaMensual(req, res) {
    try {
      const anio = req.query.anio || new Date().getFullYear();
      const { id_vendedor, id_sucursal, tipo_entrega } = req.query;

      const filtros = {
        ...(id_vendedor && { id_vendedor }),
        ...(id_sucursal && { id_sucursal }),
        ...(tipo_entrega && { tipo_entrega }),
      };

      const data = await VentasEstadisticasService.calcularEstadisticasPorAno(
        anio,
        filtros
      );

      const meses = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      const respuesta = Array.from({ length: 12 }, (_, i) => {
        const mesData = data.find((d) => parseInt(d.mes) === i + 1);
        return {
          month: meses[i],
          revenue: mesData ? parseFloat(mesData.total_mes) : 0,
        };
      });

      return res.status(200).json(respuesta);
    } catch (error) {
      console.error("Error al obtener tendencia mensual:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async resumenPorTipoEntrega(req, res) {
    try {
      const fecha = req.query.fecha;
      if (!fecha) {
        return res.status(400).json({ message: "La fecha es requerida" });
      }

      const data = await VentasEstadisticasService.resumenVentasPorTipoEntrega(
        fecha
      );
      return res.status(200).json(data);
    } catch (error) {
      console.error(
        "Error al obtener resumen por tipo de entrega:",
        error.message
      );
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default new VentasEstadisticasController();

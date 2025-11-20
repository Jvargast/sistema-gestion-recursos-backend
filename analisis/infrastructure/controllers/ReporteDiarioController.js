import ReporteDiarioService from "../../application/ReporteDiarioService.js";
import {
  convertirFechaLocal,
  obtenerFechaActualChile,
} from "../../../shared/utils/fechaUtils.js";

class ReporteDiarioController {
  async obtener(req, res) {
    try {
      let { fecha, id_sucursal } = req.query;

      if (!fecha) {
        const hoy = obtenerFechaActualChile();
        const fechaChile = convertirFechaLocal(hoy);
        fecha = fechaChile.format("YYYY-MM-DD");
      } else {
        fecha = String(fecha).slice(0, 10); 
      }

      const idSucursalNum = id_sucursal ? Number(id_sucursal) : undefined;

      const reporte = await ReporteDiarioService.buildReporteDiario({
        fecha,
        id_sucursal: idSucursalNum,
      });

      return res.status(200).json(reporte);
    } catch (error) {
      console.error("Error al obtener reporte diario:", error);
      return res.status(500).json({
        error: "Error interno del servidor al generar reporte diario",
      });
    }
  }
}

export default new ReporteDiarioController();

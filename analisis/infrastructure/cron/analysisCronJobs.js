import cron from "node-cron";
import dayjs from "dayjs";
import VentasEstadisticasService from "../../application/VentasEstadisticasService.js";
import PedidosEstadisticasService from "../../application/PedidosEstadisticasService.js";
import ProductoEstadisticasService from "../../application/ProductoEstadisticasService.js";
import { obtenerFechaChile } from "../../../shared/utils/fechaUtils.js";

const setupCronJobs = () => {
  cron.schedule("5 0 * * *", async () => {
    const fecha = dayjs(obtenerFechaChile("YYYY-MM-DD"))
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    console.log(`[CRON] Generando estadísticas para el día ${fecha}`);

    try {
      await VentasEstadisticasService.generarEstadisticasPorDia(fecha);
      await PedidosEstadisticasService.generarEstadisticasPorDia(fecha);
      await ProductoEstadisticasService.generarEstadisticasPorDia(fecha);

      console.log("[CRON] ✅ Estadísticas diarias generadas con éxito.");
    } catch (error) {
      console.error(
        "[CRON] ❌ Error al generar estadísticas diarias:",
        error.message
      );
    }
  });

  cron.schedule("10 0 1 * *", async () => {
    const previousMonth = dayjs(obtenerFechaChile("YYYY-MM-DD")).subtract(
      1,
      "month"
    );
    const year = previousMonth.year();
    const month = previousMonth.month() + 1;

    console.log(
      `[CRON] Generando estadísticas mensuales para ${year}-${month}`
    );

    try {
      await VentasEstadisticasService.calcularDatosMensuales(year, month);
      await PedidosEstadisticasService.calcularDatosMensuales(year, month);
      await ProductoEstadisticasService.calcularDatosMensuales(year, month);

      console.log("[CRON] ✅ Estadísticas mensuales generadas.");
    } catch (error) {
      console.error(
        "[CRON] ❌ Error en estadísticas mensuales:",
        error.message
      );
    }
  });

  cron.schedule("15 0 1 1 *", async () => {
    const year = dayjs(obtenerFechaChile("YYYY-MM-DD"))
      .subtract(1, "year")
      .year();
    console.log(`[CRON] Generando estadísticas anuales para ${year}`);

    try {
      await VentasEstadisticasService.calcularEstadisticasPorAno(year);
      console.log("[CRON] ✅ Estadísticas anuales generadas.");
    } catch (error) {
      console.error("[CRON] ❌ Error en estadísticas anuales:", error.message);
    }
  });

  /* cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Monitoreando ventas recientes...");

    try {
      const { ventasRecientes } =
        await VentasEstadisticasService.monitorearVentasRecientes();

      if (ventasRecientes.length > 0) {
        console.log(
          `[CRON] Se detectaron ${ventasRecientes.length} ventas recientes.`
        );
      } else {
        console.log(
          "[CRON] No se detectaron ventas recientes en la última hora."
        );
      }
    } catch (error) {
      console.error(
        "[CRON] ❌ Error monitoreando ventas recientes:",
        error.message
      );
    }
  }); */
};

export default setupCronJobs;

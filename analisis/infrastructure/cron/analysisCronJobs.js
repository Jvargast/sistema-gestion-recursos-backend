import cron from "node-cron";
import VentasEstadisticasService from "../../application/VentasEstadisticasService.js";
import PedidosEstadisticasService from "../../application/PedidosEstadisticasService.js";
import ProductoEstadisticasService from "../../application/ProductoEstadisticasService.js";

const setupCronJobs = () => {
  // 📆 Generación diaria de estadísticas
  cron.schedule("5 0 * * *", async () => {
    const fecha = new Date().toISOString().split("T")[0];
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

  // 📆 Generación mensual de estadísticas
  cron.schedule("10 0 1 * *", async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

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

  // 📆 Estadísticas anuales
  cron.schedule("15 0 1 1 *", async () => {
    const year = new Date().getFullYear() - 1;
    console.log(`[CRON] Generando estadísticas anuales para ${year}`);

    try {
      await VentasEstadisticasService.calcularEstadisticasPorAno(year);
      await PedidosEstadisticasService.calcularEstadisticasPorAno(year);
      await ProductoEstadisticasService.calcularEstadisticasPorAno(year);
      console.log("[CRON] ✅ Estadísticas anuales generadas.");
    } catch (error) {
      console.error("[CRON] ❌ Error en estadísticas anuales:", error.message);
    }
  });

  // 🕒 Monitoreo horario recientes
  cron.schedule("0 * * * *", async () => {
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
  });
};

export default setupCronJobs;

import cron from "node-cron";
import VentasEstadisticasService from "../../application/VentasEstadisticasService.js";
import ProductoEstadisticasService from "../../application/ProductoEstadisticasService.js";

const setupCronJobs = () => {
  // Actualizar estadísticas anuales
  cron.schedule("0 0 1 1 *", async () => {
    const year = new Date().getFullYear() - 1;
    console.log(`Actualizando estadísticas para el año ${year}`);
    try {
      await VentasEstadisticasService.calcularEstadisticasPorAno(year);
      console.log("[CRON] Estadísticas anuales actualizadas con éxito.");
    } catch (error) {
      console.error("[CRON] Error al actualizar estadísticas anuales:", error);
    }
  });

  // Actualizar estadísticas mensuales
  /*   cron.schedule("0 0 1 * *", async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    console.log(
      `[CRON] Actualizando estadísticas mensuales para ${year}-${month}`
    );
    try {
      await VentasEstadisticasService.calcularDatosMensuales(year, month);
      console.log("[CRON] Estadísticas mensuales actualizadas con éxito.");
    } catch (error) {
      console.error(
        "[CRON] Error al actualizar estadísticas mensuales:",
        error
      );
    }
  }); */
  // Actualizar estadísticas diarias y mensuales cada noche
  cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    console.log(`[CRON] Calculando estadísticas diarias: ${now}`);
    try {
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      await VentasEstadisticasService.calcularDatosMensuales(year, month);
      console.log(`[CRON] Estadísticas actualizadas para ${year}-${month}`);
    } catch (error) {
      console.error("[CRON] Error al calcular estadísticas:", error);
    }
  });

  // Actualizar estadísticas anuales por producto
  cron.schedule("0 0 15 1 *", async () => {
    const year = new Date().getFullYear() - 1;
    console.log(`[CRON] Actualizando estadísticas de productos para ${year}`);
    try {
      await ProductoEstadisticasService.calcularEstadisticasPorAno(year);
      console.log("[CRON] Estadísticas de productos actualizadas con éxito.");
    } catch (error) {
      console.error(
        "[CRON] Error al actualizar estadísticas de productos:",
        error
      );
    }
  });

  // Monitorear ventas recientes cada hora
  cron.schedule("0 * * * *", async () => {
    const now = new Date().toISOString();
    console.log(`[CRON] Monitoreando ventas recientes: ${now}`);
    try {
     /*  const resultados =
        await VentasEstadisticasService.monitorearVentasRecientes();
      console.log("[CRON] Monitoreo de ventas completado:", resultados); */
      const recientes =
        await VentasEstadisticasService.monitorearVentasRecientes();
      if (recientes.transaccionesRecientes.length > 0) {
        console.log(
          `[CRON] Ventas recientes: ${recientes.transaccionesRecientes.length}`
        );

        for (const transaccion of recientes.transaccionesRecientes) {
          await ProductoEstadisticasService.calcularEstadisticasPorProducto(
            transaccion.id_producto,
            new Date(transaccion.fecha_creacion).getFullYear()
          );
          await VentasEstadisticasService.actualizarPorAno(
            new Date(transaccion.fecha_creacion).getFullYear()
          );
        }
      } else {
        console.log("[CRON] No hay transacciones recientes en la última hora.");
      }
    } catch (error) {
      console.error("[CRON] Error al monitorear ventas recientes:", error);
    }
  });

  // Actualizar estadísticas diarias
  /*   cron.schedule("0 23 * * *", async () => {
    const today = new Date().toISOString().split("T")[0];
    console.log(`Actualizando estadísticas para el día ${today}`);
    // Implementar lógica si necesitas estadísticas diarias
  });

  // Monitorear ventas recientes
  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    console.log(`Monitoreando ventas recientes: ${now}`);
    // Implementar lógica de monitoreo
  }); */
};

export default setupCronJobs;

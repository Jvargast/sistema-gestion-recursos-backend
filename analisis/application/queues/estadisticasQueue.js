import Queue from "bull";

const estadisticasQueue = new Queue("calcularEstadisticas", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

estadisticasQueue.process(async (job) => {
  const { year } = job.data;
  console.log(`Procesando estadísticas para el año ${year}`);
  const VentasEstadisticasService = require("../services/VentasEstadisticasService.js");
  return await VentasEstadisticasService.calcularEstadisticasPorAno(year);
});

estadisticasQueue.on("completed", (job, result) => {
  console.log(`Estadísticas para el año ${job.data.year} calculadas con éxito.`);
});

estadisticasQueue.on("failed", (job, err) => {
  console.error(`Error al calcular estadísticas para el año ${job.data.year}: ${err.message}`);
});

export default estadisticasQueue;

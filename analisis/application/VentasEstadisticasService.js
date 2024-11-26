import TransaccionRepository from "../infrastructure/repositories/TransaccionRepository.js";
import VentasEstadisticasRepository from "../infrastructure/repositories/VentasEstadisticasRepository.js";

class VentasEstadisticasService {
  async actualizarEstadisticasGlobales() {
    const transacciones = await TransaccionRepository.findCompletadas();

    let ventasTotales = 0;
    let unidadesTotales = 0;
    const datosMensuales = {};

    for (const transaccion of transacciones) {
      const mes = new Date(transaccion.fecha).getMonth() + 1;

      ventasTotales += transaccion.total;
      unidadesTotales += transaccion.detalles.reduce(
        (acc, detalle) => acc + detalle.cantidad,
        0
      );

      if (!datosMensuales[mes]) {
        datosMensuales[mes] = { ventas: 0, unidades: 0 };
      }

      datosMensuales[mes].ventas += transaccion.total;
      datosMensuales[mes].unidades += transaccion.detalles.reduce(
        (acc, detalle) => acc + detalle.cantidad,
        0
      );
    }

    await VentasEstadisticasRepository.updateOrCreate({
      anio: new Date().getFullYear(),
      ventas_anuales: ventasTotales,
      unidades_vendidas_anuales: unidadesTotales,
      datos_mensuales: datosMensuales,
    });
  }
}

export default new VentasEstadisticasService();

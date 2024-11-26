import DetalleTransaccionRepository from "../infrastructure/repositories/DetalleTransaccionRepository.js";
import ProductoEstadisticasRepository from "../infrastructure/repositories/ProductoEstadisticasRepository.js";

class ProductoEstadisticasService {
  async actualizarEstadisticasProducto(id_producto, transacciones) {
    const estadisticas = await ProductoEstadisticasRepository.findByProductoId(id_producto);

    let ventasTotales = estadisticas?.ventas_anuales || 0;
    let unidadesTotales = estadisticas?.unidades_vendidas_anuales || 0;

    const datosMensuales = estadisticas?.datos_mensuales || {};

    for (const transaccion of transacciones) {
      const mes = new Date(transaccion.fecha).getMonth() + 1;

      ventasTotales += transaccion.subtotal;
      unidadesTotales += transaccion.cantidad;

      if (!datosMensuales[mes]) {
        datosMensuales[mes] = { ventas: 0, unidades: 0 };
      }

      datosMensuales[mes].ventas += transaccion.subtotal;
      datosMensuales[mes].unidades += transaccion.cantidad;
    }

    await ProductoEstadisticasRepository.updateOrCreate({
      id_producto,
      anio: new Date().getFullYear(),
      ventas_anuales: ventasTotales,
      unidades_vendidas_anuales: unidadesTotales,
      datos_mensuales: datosMensuales,
    });
  }
}

export default new ProductoEstadisticasService();

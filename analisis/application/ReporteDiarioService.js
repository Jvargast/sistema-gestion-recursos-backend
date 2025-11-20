import VentasEstadisticasService from "./VentasEstadisticasService.js";
import PedidosEstadisticasService from "./PedidosEstadisticasService.js";
import ProductoEstadisticasService from "./ProductoEstadisticasService.js";

import VentasEstadisticasRepository from "../infrastructure/repositories/VentasEstaditiscasRepository.js";
import PedidosEstadisticasRepository from "../infrastructure/repositories/PedidosEstadisticasRepository.js";
import ProductosEstadisticasRepository from "../infrastructure/repositories/ProductosEstadisticasRepository.js";

import PagosEstadisticas from "../domain/models/PagosEstadisticas.js";
import VentasChoferEstadisticas from "../domain/models/VentasChoferEstadisticas.js";
import EntregasEstadisticas from "../domain/models/EntregasEstadisticas.js";
import Usuarios from "../../auth/domain/models/Usuarios.js";

class ReporteDiarioService {
  /**
   * @param {Object} params
   * @param {string} params.fecha 
   * @param {number|undefined} params.id_sucursal
   */

  async buildReporteDiario({ fecha, id_sucursal }) {
    console.log(fecha)
    const idSucursalNum =
      typeof id_sucursal === "number"
        ? id_sucursal
        : id_sucursal
        ? Number(id_sucursal)
        : undefined;

    const filtroSucursal = idSucursalNum ? { id_sucursal: idSucursalNum } : {};

    await Promise.all([
      VentasEstadisticasService.generarEstadisticasPorDia(fecha),
      PedidosEstadisticasService.generarEstadisticasPorDia(fecha),
      ProductoEstadisticasService.generarEstadisticasPorDia(fecha),
    ]);

    const [
      ventasStats,
      pedidosStats,
      productosStats,
      pagosStats,
      ventasChoferStats,
      entregasStats,
    ] = await Promise.all([
      VentasEstadisticasRepository.findByFecha(fecha, filtroSucursal),
      PedidosEstadisticasRepository.findByFecha(fecha, filtroSucursal),
      ProductosEstadisticasRepository.findByFecha(fecha, filtroSucursal),

      PagosEstadisticas.findAll({
        where: { fecha, ...filtroSucursal },
        raw: true,
      }),

      VentasChoferEstadisticas.findAll({
        where: { fecha, ...filtroSucursal },
        include: [
          {
            model: Usuarios,
            as: "chofer",
            attributes: ["rut", "nombre", "apellido", "rut"],
          },
        ],
      }),

      EntregasEstadisticas.findAll({
        where: { fecha, ...filtroSucursal },
        include: [
          {
            model: Usuarios,
            as: "chofer",
            attributes: ["rut", "nombre", "apellido", "rut"],
          },
        ],
      }),
    ]);

    const ventasArr = ventasStats || [];
    const pedidosArr = pedidosStats || [];
    const productosArr = productosStats || [];
    const pagosArr = pagosStats || [];
    const ventasChoferArr = ventasChoferStats || [];
    const entregasArr = entregasStats || [];


    const totalVentasMonto = ventasArr.reduce(
      (acc, v) => acc + Number(v.monto_total || 0),
      0
    );
    const totalVentasUnidades = ventasArr.reduce(
      (acc, v) => acc + Number(v.total_ventas || 0),
      0
    );
    const ticketPromedio =
      totalVentasUnidades > 0 ? totalVentasMonto / totalVentasUnidades : 0;

    const totalPedidos = pedidosArr.reduce(
      (acc, p) => acc + Number(p.total_pedidos || 0),
      0
    );
    const totalPedidosPagados = pedidosArr.reduce(
      (acc, p) => acc + Number(p.pedidos_pagados || 0),
      0
    );
    const totalPedidosMonto = pedidosArr.reduce(
      (acc, p) => acc + Number(p.monto_total || 0),
      0
    );

    const totalProductosVendidos = productosArr.reduce(
      (acc, p) => acc + Number(p.cantidad_vendida || 0),
      0
    );
    const totalProductosMonto = productosArr.reduce(
      (acc, p) => acc + Number(p.monto_total || 0),
      0
    );

    const totalPagosMonto = pagosArr.reduce(
      (acc, p) => acc + Number(p.monto_total || 0),
      0
    );

    const totalEntregas = entregasArr.reduce(
      (acc, e) => acc + Number(e.total_entregas || 0),
      0
    );
    const totalEntregasExitosas = entregasArr.reduce(
      (acc, e) => acc + Number(e.entregas_exitosas || 0),
      0
    );
    const totalEntregasPendientes = entregasArr.reduce(
      (acc, e) => acc + Number(e.entregas_pendientes || 0),
      0
    );

    const totalVentasChoferMonto = ventasChoferArr.reduce(
      (acc, v) => acc + Number(v.monto_total || 0),
      0
    );
    const totalVentasChoferUnidades = ventasChoferArr.reduce(
      (acc, v) => acc + Number(v.total_ventas || 0),
      0
    );

    return {
      fecha,
      id_sucursal: idSucursalNum ?? null,

      resumen: {
        totalVentasMonto,
        totalVentasUnidades,
        ticketPromedio,
        totalPedidos,
        totalPedidosPagados,
        totalPedidosMonto,
        totalProductosVendidos,
        totalProductosMonto,
        totalPagosMonto,
        totalEntregas,
        totalEntregasExitosas,
        totalEntregasPendientes,
        totalVentasChoferMonto,
        totalVentasChoferUnidades,
      },

      detalle: {
        ventasPorTipoEntrega: ventasArr,
        pedidos: pedidosArr,
        productos: productosArr,
        pagos: pagosArr,
        ventasPorChofer: ventasChoferArr,
        entregasPorChofer: entregasArr,
      },
    };
  }
}

export default new ReporteDiarioService();

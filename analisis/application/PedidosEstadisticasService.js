import { Op, fn, col } from "sequelize";
import Pedido from "../../ventas/domain/models/Pedido.js";
import PedidosEstadisticasRepository from "../infrastructure/repositories/PedidosEstadisticasRepository.js";
import EstadoVentaRepository from "../../ventas/infrastructure/repositories/EstadoVentaRepository.js";

class PedidosEstadisticasService {
  async generarEstadisticasPorDia(fecha) {
    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);

    const estadoCompletado = await EstadoVentaRepository.findByNombre(
      "Completada"
    );
    if (!estadoCompletado) {
      throw new Error(
        'No se encontró el estado "Completada" en la tabla EstadoVenta'
      );
    }

    const pedidos = await Pedido.findAll({
      where: {
        fecha_pedido: {
          [Op.between]: [inicioDia, finDia],
        },
      },
      attributes: [
        "estado_pago",
        "id_estado_pedido",
        [fn("COUNT", col("id_pedido")), "cantidad"],
        [fn("SUM", col("total")), "monto_total"],
      ],
      group: ["estado_pago", "id_estado_pedido"],
      raw: true,
    });

    const mes = inicioDia.getMonth() + 1;
    const anio = inicioDia.getFullYear();

    const registros = await Promise.all(
      pedidos.map(async (p) => {
        const estadoPago = p.estado_pago;
        const estadoPedidoId = parseInt(p.id_estado_pedido);
        const cantidad = parseInt(p.cantidad);
        const monto = parseFloat(p.monto_total);

        const yaExiste =
          await PedidosEstadisticasRepository.findByFechaEstadoPagoYEstadoPedido(
            inicioDia,
            estadoPago,
            estadoPedidoId
          );

        const data = {
          fecha: inicioDia,
          mes,
          anio,
          estado_pago: estadoPago,
          id_estado_pedido: estadoPedidoId,
          total_pedidos: cantidad,
          pedidos_pagados:
            estadoPago === "Pagado" &&
            estadoPedidoId === estadoCompletado.id_estado_venta
              ? cantidad
              : 0,
          monto_total: monto,
        };

        if (yaExiste) {
          return await PedidosEstadisticasRepository.updateById(
            yaExiste.id,
            data
          );
        } else {
          return await PedidosEstadisticasRepository.create(data);
        }
      })
    );

    return registros;
  }

  async obtenerEstadisticasPorMes(mes, anio) {
    return await PedidosEstadisticasRepository.findAllByMesYAnio(mes, anio);
  }

  async eliminarEstadisticasPorFecha(fecha) {
    return await PedidosEstadisticasRepository.deleteByFecha(fecha);
  }
  async obtenerKpiPorFecha(fecha) {
    const registros = await PedidosEstadisticasRepository.findByFecha(fecha);

    if (!registros || registros.length === 0) {
      return {
        fecha,
        total_pedidos: 0,
        detalles: {},
      };
    }

    let total = 0;
    const detalles = {};

    for (const r of registros) {
      const cantidad = parseInt(r.total_pedidos || 0);
      total += cantidad;

      const estadoNombre = await EstadoVentaRepository.findNombreById(
        r.id_estado_pedido
      );

      const clave = `${estadoNombre} / ${r.estado_pago}`;

      detalles[clave] = {
        cantidad,
        pedidos_pagados: r.pedidos_pagados,
        monto_total: parseFloat(r.monto_total),
      };
    }

    return {
      fecha,
      total_pedidos: total,
      detalles,
    };
  }
}

export default new PedidosEstadisticasService();

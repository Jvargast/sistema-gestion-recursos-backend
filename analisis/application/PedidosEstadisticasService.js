import { Op, fn, col } from "sequelize";
import Pedido from "../../ventas/domain/models/Pedido.js";
import PedidosEstadisticasRepository from "../infrastructure/repositories/PedidosEstadisticasRepository.js";
import EstadoVentaRepository from "../../ventas/infrastructure/repositories/EstadoVentaRepository.js";
import { convertirALaUtc, convertirFechaLocal } from "../../shared/utils/fechaUtils.js";

class PedidosEstadisticasService {
  async generarEstadisticasPorDia(fecha) {
    const fechaChile = convertirFechaLocal(fecha);

    const inicioDia = convertirALaUtc(fechaChile.startOf("day")).toDate();
    const finDia = convertirALaUtc(fechaChile.endOf("day")).toDate();

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

    const mes = fechaChile.month() + 1;
    const anio = fechaChile.year();

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
          fecha: fechaChile.format("YYYY-MM-DD"),
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
        detalles: [],
      };
    }

    let total = 0;
    const detalles = [];

    for (const r of registros) {
      const cantidad = parseInt(r.total_pedidos || 0);
      total += cantidad;

      const estado = await EstadoVentaRepository.findById(r.id_estado_pedido);

      detalles.push({
        estado_pedido: estado.nombre_estado,
        estado_pago: r.estado_pago,
        cantidad,
        pedidos_pagados: r.pedidos_pagados,
        monto_total: parseFloat(r.monto_total),
      });
    }

    return {
      fecha,
      total_pedidos: total,
      detalles,
    };
  }

  async calcularDatosMensuales(anio, mes) {
    const registros = await PedidosEstadisticasRepository.findAllByMesYAnio(
      mes,
      anio
    );

    const resumen = registros.reduce(
      (acc, registro) => {
        acc.total += registro.total_pedidos || 0;
        acc.pagados += registro.pedidos_pagados || 0;
        acc.monto += parseFloat(registro.monto_total || 0);
        return acc;
      },
      { total: 0, pagados: 0, monto: 0 }
    );

    // Puedes guardar o retornar el resumen mensual si deseas almacenarlo
    return resumen;
  }
}

export default new PedidosEstadisticasService();

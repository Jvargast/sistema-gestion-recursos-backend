import { Op, fn, col } from "sequelize";
import Pedido from "../../ventas/domain/models/Pedido.js";
import PedidosEstadisticasRepository from "../infrastructure/repositories/PedidosEstadisticasRepository.js";

class PedidosEstadisticasService {
  async generarEstadisticasPorDia(fecha) {
    const inicioDia = new Date(fecha);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const pedidos = await Pedido.findAll({
      where: {
        fecha_pedido: {
          [Op.between]: [inicioDia, finDia],
        },
      },
      attributes: [
        "estado_pago",
        [fn("COUNT", col("id_pedido")), "cantidad"],
        [fn("SUM", col("total")), "monto_total"],
      ],
      group: ["estado_pago"],
      raw: true,
    });

    const mes = inicioDia.getMonth() + 1;
    const anio = inicioDia.getFullYear();

    const registros = await Promise.all(
      pedidos.map((p) =>
        PedidosEstadisticasRepository.create({
          fecha: inicioDia,
          mes,
          anio,
          total_pedidos: parseInt(p.cantidad),
          pedidos_pagados:
            p.estado_pago === "Pagado" ? parseInt(p.cantidad) : 0,
          monto_total: parseFloat(p.monto_total),
        })
      )
    );

    return registros;
  }

  async obtenerEstadisticasPorMes(mes, anio) {
    return await PedidosEstadisticasRepository.findAllByMesYAnio(mes, anio);
  }

  async eliminarEstadisticasPorFecha(fecha) {
    return await PedidosEstadisticasRepository.deleteByFecha(fecha);
  }
}

export default new PedidosEstadisticasService();

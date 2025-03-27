import { Op, fn, col } from "sequelize";
import Venta from "../../ventas/domain/models/Venta.js";
import VentasEstadisticasRepository from "../infrastructure/repositories/VentasEstaditiscasRepository.js";
import sequelize from "../../database/database.js";

class VentasEstadisticasService {
  async generarEstadisticasPorDia(fecha) {
    const fechaStr = fecha;
    const fechaDate = new Date(`${fechaStr}T00:00:00`);

    // Buscar todas las ventas del día completo
    const ventas = await Venta.findAll({
      where: {
        fecha: {
          [Op.between]: [`${fechaStr} 00:00:00`, `${fechaStr} 23:59:59`],
        },
      },
      attributes: [
        "tipo_entrega",
        [fn("COUNT", col("id_venta")), "cantidad"],
        [fn("SUM", col("total")), "monto_total"],
      ],
      group: ["tipo_entrega"],
      raw: true,
    });

    if (!ventas || ventas.length === 0) {
      return {
        message: "No se encontraron ventas para la fecha indicada",
        count: 0,
      };
    }

    const dia = fechaDate.getDate();
    const mes = fechaDate.getMonth() + 1;
    const anio = fechaDate.getFullYear();

    // Upsert por cada tipo_entrega
    const registros = await Promise.all(
      ventas.map(async (v) => {
        const existente = await VentasEstadisticasRepository.findByFechaYTipo(
          fechaStr,
          v.tipo_entrega
        );
        if (existente) {
          return await VentasEstadisticasRepository.updateById(existente.id, {
            mes,
            anio,
            total_ventas: parseInt(v.cantidad),
            monto_total: parseFloat(v.monto_total),
          });
        } else {
          return await VentasEstadisticasRepository.create({
            fecha: fechaStr,
            mes,
            anio,
            tipo_entrega: v.tipo_entrega,
            total_ventas: parseInt(v.cantidad),
            monto_total: parseFloat(v.monto_total),
          });
        }
      })
    );

    return {
      message: "Estadísticas generadas correctamente",
      count: registros.length,
      registros,
    };
  }

  async obtenerEstadisticasPorMes(mes, anio) {
    return await VentasEstadisticasRepository.findAllByMesYAnio(mes, anio);
  }

  async eliminarEstadisticasPorFecha(fecha) {
    return await VentasEstadisticasRepository.deleteByFecha(fecha);
  }

  async obtenerKpiPorFecha(fecha) {
    const registros = await VentasEstadisticasRepository.findByFecha(fecha);

    if (!registros || registros.length === 0) {
      return {
        fecha,
        total_ventas: 0,
        detalles: {},
      };
    }

    let totalIngresos = 0;
    const detalles = {};

    registros.forEach((r) => {
      const tipo = r.tipo_entrega;
      const monto = parseFloat(r.monto_total);

      totalIngresos += monto;
      detalles[tipo] = {
        total: monto,
        cantidad: r.total_ventas,
      };
    });

    return {
      fecha,
      total_ventas: totalIngresos,
      detalles,
    };
  }

  async obtenerResumenSemanal() {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // domingo
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(finSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    const registros = await Venta.findAll({
      where: {
        fecha: {
          [Op.between]: [inicioSemana, finSemana],
        },
      },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("fecha")), "dia"],
        [sequelize.fn("SUM", sequelize.col("total")), "total"],
      ],
      group: ["dia"],
      order: [[sequelize.literal("dia"), "ASC"]],
      raw: true,
    });

    return registros;
  }
}

export default new VentasEstadisticasService();

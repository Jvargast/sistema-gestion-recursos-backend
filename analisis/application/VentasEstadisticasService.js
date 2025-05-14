import { Op, fn, col, cast } from "sequelize";
import Venta from "../../ventas/domain/models/Venta.js";
import VentasEstadisticasRepository from "../infrastructure/repositories/VentasEstaditiscasRepository.js";
import sequelize from "../../database/database.js";
import EstadoVentaRepository from "../../ventas/infrastructure/repositories/EstadoVentaRepository.js";
import { getWhereEstadoVentaValido } from "../../shared/utils/estadoUtils.js";
import dayjs from "dayjs";
import {
  convertirALaUtc,
  convertirFechaLocal,
} from "../../shared/utils/fechaUtils.js";

class VentasEstadisticasService {
  async generarEstadisticasPorDia(fechaUtcIso) {
    const fechaChile = convertirFechaLocal(fechaUtcIso);
    const inicioDiaUtc = convertirALaUtc(fechaChile.startOf("day")).toDate();
    const finDiaUtc = convertirALaUtc(fechaChile.endOf("day")).toDate();

    const ventas = await Venta.findAll({
      where: {
        fecha: {
          [Op.between]: [inicioDiaUtc, finDiaUtc],
        },
        ...getWhereEstadoVentaValido(),
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
        registros: [],
      };
    }

    const dia = fechaChile.date();
    const mes = fechaChile.month() + 1;
    const anio = fechaChile.year();
    const fechaStr = fechaChile.format("YYYY-MM-DD");

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
    const fechaFormato = convertirFechaLocal(fecha, "YYYY-MM-DD");

    const registros = await VentasEstadisticasRepository.findByFecha(
      fechaFormato
    );

    if (!registros || registros.length === 0) {
      return {
        fecha: fechaFormato,
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
      fecha: fechaFormato,
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
        ...getWhereEstadoVentaValido(),
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
  //Calcular por mes
  async calcularDatosMensuales(anio, mes) {
    const ventas = await Venta.findAll({
      where: {
        fecha: {
          [Op.between]: [
            new Date(`${anio}-${mes}-01`),
            new Date(`${anio}-${mes}-31`),
          ],
          ...getWhereEstadoVentaValido(),
        },
      },
      attributes: [
        [fn("DATE", col("fecha")), "dia"],
        [fn("SUM", col("total")), "total_dia"],
        [fn("COUNT", col("id_venta")), "cantidad_ventas"],
      ],
      group: [fn("DATE", col("fecha"))],
      raw: true,
    });

    return ventas;
  }
  //Calcular por año
  async calcularEstadisticasPorAno(anio, filtros = {}) {
    const estadoPagada = await EstadoVentaRepository.findByNombre("Pagada");

    const where = {
      fecha: {
        [Op.between]: [
          new Date(`${anio}-01-01T00:00:00-04:00`),
          new Date(`${anio}-12-31T23:59:59-04:00`),
        ],
      },
      total: { [Op.ne]: null },
      id_estado_venta: estadoPagada.id_estado_venta,
    };

    if (filtros.id_vendedor) {
      where.id_vendedor = filtros.id_vendedor;
    }

    if (filtros.id_sucursal) {
      where.id_sucursal = filtros.id_sucursal;
    }

    if (filtros.tipo_entrega) {
      where.tipo_entrega = filtros.tipo_entrega; // Ej: 'retiro_en_sucursal'
    }
    const resultados = await Venta.findAll({
      where,
      attributes: [
        [sequelize.literal(`EXTRACT(MONTH FROM "fecha")`), "mes"],
        [fn("SUM", cast(col("total"), "float")), "total_mes"],
        [fn("COUNT", col("id_venta")), "cantidad_ventas"],
      ],
      group: [sequelize.literal(`EXTRACT(MONTH FROM "fecha")`)],
      raw: true,
    });

    console.log(resultados);
    return resultados;
  }
  //Monitorear ventas recientes
  async monitorearVentasRecientes() {
    const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000);

    const ventas = await Venta.findAll({
      where: {
        fecha: {
          [Op.gte]: haceUnaHora,
        },
        ...getWhereEstadoVentaValido(),
      },
      raw: true,
    });

    return {
      ventasRecientes: ventas,
    };
  }

  async resumenVentasPorTipoEntrega(fecha) {
    const registros = await Venta.findAll({
      where: {
        fecha: {
          [Op.between]: [`${fecha} 00:00:00`, `${fecha} 23:59:59`],
        },
        tipo_entrega: {
          [Op.ne]: null,
        },
        ...getWhereEstadoVentaValido(),
      },
      attributes: ["tipo_entrega", [fn("COUNT", col("id_venta")), "total"]],
      group: ["tipo_entrega"],
      raw: true,
    });

    return registros.map((r) => ({
      name: this.formatearTipoEntrega(r.tipo_entrega),
      value: Number(r.total),
    }));
  }

  formatearTipoEntrega(tipo) {
    const map = {
      despacho_a_domicilio: "Despacho a Domicilio",
      retiro_en_sucursal: "Retiro en Sucursal",
      pedido_pagado_anticipado: "Pagado Anticipado",
    };
    return map[tipo] || "Otro";
  }
}

export default new VentasEstadisticasService();

import { Op } from "sequelize";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import TransaccionRepository from "../../ventas/infrastructure/repositories/TransaccionRepository.js";
import VentasEstadisticasRepository from "../infrastructure/repositories/VentasEstaditiscasRepository.js";
import DetalleTransaccionRepository from "../../ventas/infrastructure/repositories/DetalleTransaccionRepository.js";
import EstadoTransaccionService from "../../ventas/application/EstadoTransaccionService.js";
import EstadoTransaccionRepository from "../../ventas/infrastructure/repositories/EstadoTransaccionRepository.js";
import EstadoDetalleTransaccionService from "../../ventas/application/EstadoDetalleTransaccionService.js";
import { model } from "mongoose";

class VentasEstadisticasService {
  async obtenerEstadisticasPorId(id) {
    const estadisticas = await VentasEstadisticasRepository.findById(id);
    if (!estadisticas) {
      throw new Error(`No se encontraron estadísticas con el ID ${id}.`);
    }
    return estadisticas;
  }

  async crearEstadisticas(data) {
    return await VentasEstadisticasRepository.create(data);
  }

  async actualizarEstadisticas(id, data) {
    await this.obtenerEstadisticasPorId(id); // Verifica que existan
    return await VentasEstadisticasRepository.update(id, data);
  }

  async eliminarEstadisticasPorId(id) {
    await this.obtenerEstadisticasPorId(id); // Verifica que existan
    return await VentasEstadisticasRepository.delete(id);
  }

  async obtenerTodasEstadisticas(
    filters = {},
    options = { page: 1, limit: 10 }
  ) {
    const allowedFields = ["id_venta_estadisticas"];
    const where = createFilter(filters, allowedFields);

    const result = await paginate(
      VentasEstadisticasRepository.getModel(),
      options,
      {
        where,
        order: [["id_ventas_estadisticas", "ASC"]]
      }
    );
    return result.data;
  }

  async obtenerPorAno(year) {
    const estadisticas = await VentasEstadisticasRepository.findByYear(year);
    if (!estadisticas) {
      throw new Error(`No se encontraron estadísticas para el año ${year}`);
    }
    return estadisticas;
  }

  async obtenerPorMes(year, month) {
    const estadisticas = await VentasEstadisticasRepository.findByYear(year);
    if (!estadisticas) {
      throw new Error(`No se encontraron estadísticas para el año ${year}`);
    }

    // Extraer datos mensuales
    const datosMensuales = estadisticas.datos_mensuales || [];
    const datosMes = datosMensuales[month - 1];

    if (!datosMes) {
      throw new Error(`No se encontraron estadísticas para ${year}-${month}`);
    }

    return datosMes;
  }

  async actualizarPorAno(year) {
    const estadisticas = await this.calcularEstadisticasPorAno(year);
    return estadisticas;
  }
  // calcular estadisticas por año
  async calcularEstadisticasPorAno(year) {
    // Obtener todas las transacciones completadas en el año

    const estadoPermitido = await EstadoTransaccionService.findByNombre(
      "Completada"
    );
    //Colocar este detalle para ventas Pagadas y detalles Entregado
    const estadoDetalle = await EstadoDetalleTransaccionService.findByNombre(
      "Entregado"
    );

    const transacciones = await TransaccionRepository.findAllWithConditions({
      where: {
        tipo_transaccion: "venta",
        id_estado_transaccion: estadoPermitido.dataValues.id_estado_transaccion,
        fecha_creacion: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      include: [
        {
          model: EstadoTransaccionRepository.getModel(),
          as: "estado",
          attributes: ["nombre_estado"], // Opcional, para ver nombres en las transacciones
        },
        {
          model: DetalleTransaccionRepository.getModel(),
          as: "detalles",
          where: {
            estado_producto_transaccion:
              estadoDetalle.dataValues.id_estado_detalle_transaccion,
          },
        },
      ],
    });


    if (transacciones.length === 0) {
      throw new Error(`No se encontraron transacciones para el año ${year}.`);
    }

    const ventasAnuales = transacciones.reduce(
      (total, transaccion) =>
        total +
        transaccion.detalles.reduce(
          (sum, detalle) => sum + detalle.cantidad,
          0
        ),
      0
    );

    const unidadesVendidasAnuales = await this.calcularUnidadesVendidasPorAno(
      year
    );

    /* const datosMensuales = await this.calcularDatosMensuales(
      year,
      estadoPermitido.dataValues.id_estado_transaccion,
      estadoDetalle.dataValues.id_estado_detalle_transaccion
    ); */
    // Calcular datos mensuales
    const datosMensuales = Array.from({ length: 12 }, (_, index) => {
      const mes = index + 1;
      const transaccionesMes = transacciones.filter((transaccion) => {
        const mesTransaccion =
          new Date(transaccion.fecha_creacion).getMonth() + 1;
        return mesTransaccion === mes;
      });

      const totalMes = transaccionesMes.reduce(
        (total, transaccion) => total + transaccion.total,
        0
      );

      const unidadesMes = transaccionesMes.reduce(
        (total, transaccion) =>
          total +
          transaccion.detalles.reduce(
            (sum, detalle) => sum + detalle.cantidad,
            0
          ),
        0
      );

      return {
        mes,
        total: totalMes,
        unidades: unidadesMes,
      };
    });
    // Crear o actualizar las estadísticas
    const estadisticas = {
      year,
      ventas_anuales: ventasAnuales,
      unidades_vendidas_anuales: unidadesVendidasAnuales,
      datos_mensuales: datosMensuales,
    };

    const existente = await VentasEstadisticasRepository.findByYear(year);

    if (existente) {
      return await VentasEstadisticasRepository.updateById(
        existente[0].dataValues.id_ventas_estadisticas,
        estadisticas
      );
    } else {
      return await VentasEstadisticasRepository.create(estadisticas);
    }
  }

  /**
   * Calcular unidades vendidas anualmente. también se debe revisar
   */
  async calcularUnidadesVendidasPorAno(year) {
    const estadoPermitido = await EstadoTransaccionService.findByNombre(
      "Completada"
    );

    const estadoDetalle = await EstadoDetalleTransaccionService.findByNombre(
      "Entregado"
    );

    const detalles = await DetalleTransaccionRepository.findAllWithConditions({
      where: {
        "$transaccion.tipo_transaccion$": "venta",
        "$transaccion.id_estado_transaccion$":
          estadoPermitido.dataValues.id_estado_transaccion,
        "$transaccion.fecha_creacion$": {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
        estado_producto_transaccion:
          estadoDetalle.dataValues.id_estado_detalle_transaccion,
      },
      include: [
        {
          model: TransaccionRepository.getModel(),
          as: "transaccion",
          attributes: ["id_estado_transaccion", "fecha_creacion"],
        },
      ],
    });
    /* if (!detalles) {
      throw new Error("No existen detalles asociados");
    } */
    return detalles.reduce((total, detalle) => total + detalle.cantidad, 0);
  }

  /**
   * Calcular datos mensuales.
   */
  async calcularDatosMensuales(year, idEstadoTransaccion, idEstadoDetalle) {
    const transacciones = await TransaccionRepository.findAllWithConditions({
      where: {
        tipo_transaccion: "venta",
        id_estado_transaccion: idEstadoTransaccion,
        fecha_creacion: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      include: [
        {
          model: DetalleTransaccionRepository.getModel(),
          as: "detalles",
          attributes: ["cantidad", "id_transaccion"],
          where: {
            estado_producto_transaccion: idEstadoDetalle,
          },
        },
      ],
    });

    // Se necesita verificar este apartado
    const datosMensuales = Array(12).fill({ total: 0, unidades: 0 });

    // Calcular datos mensuales
    transacciones.forEach((transaccion) => {
      const month = new Date(transaccion.fecha_creacion).getMonth(); // Obtener el mes (0-11)

      // Sumar el total de la transacción al mes correspondiente
      datosMensuales[month].total += transaccion.total;

      // Sumar la cantidad de unidades del detalle de transacciones
      if (transaccion.detalles) {
        transaccion.detalles.forEach((detalle) => {
          datosMensuales[month].unidades += detalle.cantidad;
        });
      }
    });

    return datosMensuales.map((mes, index) => ({
      mes: index + 1,
      total: mes.total,
      unidades: mes.unidades,
    }));
  }
  /**
   *
   * Monitoreo de eventoss
   */
  async monitorearVentasRecientes() {
    const desde = new Date();
    desde.setHours(desde.getHours() - 1); // Última hora
    const excludedStates = ["Cancelada", "Rechazada"];
    const estadosPermitidos =
      await EstadoTransaccionService.obtenerEstadosPermitidos(excludedStates);

    const transaccionesRecientes =
      await TransaccionRepository.findAllWithConditions({
        where: {
          tipo_transaccion: "venta",
          id_estado_transaccion: {
            [Op.in]: estadosPermitidos.map(
              (estado) => estado.id_estado_transaccion
            ),
          },
          fecha_creacion: {
            [Op.gte]: desde,
          },
        },
        include: [
          {
            model: DetalleTransaccionRepository.getModel(),
            as: "detallesTransaccion",
            attributes: ["cantidad", "id_transaccion"],
          },
        ],
      });

    if (transaccionesRecientes.length === 0) {
      return "No hay transacciones recientes en la última hora.";
    }

    const totalRecientes = transaccionesRecientes.reduce(
      (total, transaccion) => total + transaccion.total,
      0
    );

    const unidadesRecientes = await this.calcularUnidadesVendidasRecientes(
      transaccionesRecientes
    );

    return {
      totalRecientes,
      unidadesRecientes,
      transaccionesRecientes,
    };
  }
  // Unidades vendidas.
  async calcularUnidadesVendidasRecientes(transacciones) {
    return transacciones.reduce((total, transaccion) => {
      return (
        total +
        transaccion.detalles.reduce(
          (subtotal, detalle) => subtotal + detalle.cantidad,
          0
        )
      );
    }, 0);
  }
  /**
   * No implementada, falta método findCompletadas
   */
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

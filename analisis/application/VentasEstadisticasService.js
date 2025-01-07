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
import EstadisticasTransacciones from "../domain/models/EstadisticasTransacciones.js";

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

  async obtenerPorMes(year, month) {
    try {
      // Buscar estadísticas por año
      const estadisticas = await VentasEstadisticasRepository.findByYear(year);
  
      // Depuración: Verificar datos devueltos
      console.log("Estadísticas encontradas para el año:", year, estadisticas);
  
      if (!estadisticas || estadisticas.length === 0) {
        throw new Error(`No se encontraron estadísticas para el año ${year}`);
      }
  
      // Validar que el campo datos_mensuales exista y sea un array
      const datosMensuales = estadisticas[0]?.dataValues?.datos_mensuales || [];
      console.log("Datos mensuales disponibles:", datosMensuales);
  
      if (!Array.isArray(datosMensuales) || datosMensuales.length === 0) {
        throw new Error(
          `Los datos mensuales están vacíos o no existen para el año ${year}`
        );
      }
  
      // Asegurarse de que `month` sea un número
      const mesBuscado = parseInt(month, 10);
  
      // Buscar el objeto correspondiente al mes solicitado
      const datosMes = datosMensuales.find((dato) => parseInt(dato.mes, 10) === mesBuscado);
      console.log(`Datos para el mes ${mesBuscado}:`, datosMes);
  
      if (!datosMes) {
        throw new Error(
          `No se encontraron estadísticas para el mes ${mesBuscado} del año ${year}`
        );
      }
  
      // Retornar las estadísticas del mes solicitado
      return {
        year,
        month: mesBuscado,
        total: datosMes.total,
        unidades: datosMes.unidades,
      };
    } catch (error) {
      console.error(
        `Error al obtener estadísticas para ${year}-${month}: ${error.message}`
      );
      throw new Error(
        `Error al obtener estadísticas: ${error.message}`
      );
    }
  }
  
  

  /*   async obtenerPorAno(year) {
    const estadisticas = await VentasEstadisticasRepository.findByYear(year);
    if (!estadisticas) {
      throw new Error(`No se encontraron estadísticas para el año ${year}`);
    }
    return estadisticas;
  } */

  async obtenerPorAno(year) {
    try {
      // Buscar las estadísticas para el año dado en la tabla `VentasEstadisticas`
      const estadisticas = await VentasEstadisticasRepository.findByYear(year);

      //console.log(estadisticas[0].dataValues.datos_mensuales)
      if (!estadisticas || estadisticas.length === 0) {
        throw new Error(`No se encontraron estadísticas para el año ${year}`);
      }

      // Extraer y formatear los datos mensuales
      const estadisticasData = estadisticas[0].dataValues;

      const datosMensuales = estadisticasData.datos_mensuales || [];

      // Asegurarse de que los valores sean numéricos
      const formattedDatosMensuales = datosMensuales.map((mes) => ({
        mes: mes.mes,
        total: parseFloat(mes.total) || 0,
        unidades: parseInt(mes.unidades, 10) || 0,
      }));

      // Retornar la respuesta en el formato esperado
      return {
        id_ventas_estadisticas: estadisticasData.id_ventas_estadisticas,
        year: estadisticasData.year,
        ventas_anuales: parseFloat(estadisticasData.ventas_anuales) || 0,
        unidades_vendidas_anuales:
          parseInt(estadisticasData.unidades_vendidas_anuales, 10) || 0,
        datos_mensuales: formattedDatosMensuales,
      };
    } catch (error) {
      console.error("Error en obtenerPorAno:", error.message);
      throw error;
    }
  }

  async actualizarPorAno(year) {
    return await this.calcularEstadisticasPorAno(year);
  }
  // calcular estadisticas por año
  async calcularEstadisticasPorAno(year) {
    try {
      const estadoPermitido = await EstadoTransaccionService.findByNombre(
        "Completada"
      );
      const estadoDetalle = await EstadoDetalleTransaccionService.findByNombre(
        "Entregado"
      );

      if (!estadoPermitido || !estadoDetalle) {
        throw new Error(
          "Estados requeridos no encontrados: Completada o Entregado."
        );
      }

      // Obtener transacciones del año con detalles en el estado 'Entregado'
      const transacciones = await TransaccionRepository.findAllWithConditions({
        where: {
          tipo_transaccion: "venta",
          id_estado_transaccion:
            estadoPermitido.dataValues.id_estado_transaccion,
          fecha_creacion: {
            [Op.between]: [`${year}-01-01`, `${year}-12-31`],
          },
        },
        include: [
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

      if (!transacciones.length) {
        throw new Error(
          `No se encontraron transacciones completadas para el año ${year}.`
        );
      }

      const ventasAnuales = transacciones.reduce(
        (total, transaccion) =>
          total +
          transaccion.detalles.reduce(
            (sum, detalle) => sum + detalle.subtotal,
            0
          ),
        0
      );

      const unidadesVendidasAnuales = transacciones.reduce(
        (total, transaccion) =>
          total +
          transaccion.detalles.reduce(
            (sum, detalle) => sum + detalle.cantidad,
            0
          ),
        0
      );

      const datosMensuales = Array.from({ length: 12 }, (_, index) => {
        const mes = index + 1;
        const transaccionesMes = transacciones.filter((transaccion) => {
          const mesTransaccion =
            new Date(transaccion.fecha_creacion).getMonth() + 1;
          return mesTransaccion === mes;
        });

        const totalMes = transaccionesMes.reduce(
          (total, transaccion) =>
            total +
            transaccion.detalles.reduce(
              (sum, detalle) => sum + detalle.subtotal,
              0
            ),
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

        return { mes, total: totalMes, unidades: unidadesMes };
      });

      const estadisticas = {
        year,
        ventas_anuales: ventasAnuales,
        unidades_vendidas_anuales: unidadesVendidasAnuales,
        datos_mensuales: datosMensuales,
      };

      // Verificar si ya existe un registro para el año
      let resultado = await VentasEstadisticasRepository.findOneByYear(year);

      if (resultado) {
        // Actualizar estadísticas existentes
        await VentasEstadisticasRepository.updateById(
          resultado.id_ventas_estadisticas,
          estadisticas
        );
      } else {
        // Crear nuevas estadísticas
        resultado = await VentasEstadisticasRepository.create(estadisticas);
      }

      // Actualizar la tabla `EstadisticasTransacciones`
      await EstadisticasTransacciones.destroy({
        where: { id_ventas_estadisticas: resultado.id_ventas_estadisticas },
      });

      const estadisticasTransacciones = transacciones.map((transaccion) => ({
        id_ventas_estadisticas: resultado.id_ventas_estadisticas,
        id_transaccion: transaccion.id_transaccion,
      }));

      await EstadisticasTransacciones.bulkCreate(estadisticasTransacciones);

      return resultado;
    } catch (error) {
      console.error("Error en calcularEstadisticasPorAno:", error.message);
      throw error;
    }
  }

  /**
   * Calcular unidades vendidas anualmente. también se debe revisar
   */
  async calcularUnidadesVendidasPorAno(year) {
    const estadoPermitido = await EstadoTransaccionService.findByNombre(
      "Completada"
    );
    if (!estadoPermitido) {
      throw new Error(`No se encontró un estado con nombre "Completada"`);
    }

    const estadoDetalle = await EstadoDetalleTransaccionService.findByNombre(
      "Entregado"
    );
    if (!estadoDetalle) {
      throw new Error(
        `No se encontró un estado detalle con nombre "Entregado"`
      );
    }

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
            as: "detalles",
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

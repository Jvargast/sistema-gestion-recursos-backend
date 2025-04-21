import { Op, fn, col } from "sequelize";
import DetalleVenta from "../../ventas/domain/models/DetalleVenta.js";
import ProductosEstadisticasRepository from "../infrastructure/repositories/ProductosEstadisticasRepository.js";
import Venta from "../../ventas/domain/models/Venta.js";
import Producto from "../../inventario/domain/models/Producto.js";
import DetallePedido from "../../ventas/domain/models/DetallePedido.js";
import Pedido from "../../ventas/domain/models/Pedido.js";
import sequelize from "../../database/database.js";

class ProductoEstadisticasService {
  async generarEstadisticasPorDia(fecha) {
    const inicioDia = `${fecha}T00:00:00`;
    const finDia = `${fecha}T23:59:59.999`;

    const fechaDate = new Date(inicioDia);

    const detalles = await DetalleVenta.findAll({
      include: [
        {
          model: Venta,
          as: "venta",
          where: {
            fecha: {
              [Op.between]: [inicioDia, finDia],
            },
          },
          attributes: [],
        },
      ],
      attributes: [
        "id_producto",
        [fn("SUM", col("cantidad")), "cantidad_vendida"],
        [fn("SUM", col("subtotal")), "monto_total"],
      ],
      group: ["id_producto"],
      raw: true,
    });

    if (!detalles || detalles.length === 0) {
      return {
        message: `No se encontraron ventas para la fecha ${fecha}`,
        count: 0,
      };
    }

    const mes = fechaDate.getMonth() + 1;
    const anio = fechaDate.getFullYear();

    const registros = await Promise.all(
      detalles.map(async (d) => {
        const idProducto = d.id_producto;
        const cantidad = parseInt(d.cantidad_vendida);
        const monto = parseFloat(d.monto_total);

        const existente =
          await ProductosEstadisticasRepository.findByFechaYProducto(
            fecha,
            idProducto
          );

        const data = {
          id_producto: idProducto,
          fecha: fechaDate,
          mes,
          anio,
          cantidad_vendida: cantidad,
          monto_total: monto,
        };

        if (existente) {
          return await ProductosEstadisticasRepository.updateById(
            existente.id,
            data
          );
        } else {
          return await ProductosEstadisticasRepository.create(data);
        }
      })
    );

    return {
      message: "Estadísticas de productos generadas correctamente",
      count: registros.length,
      registros,
    };
  }

  async obtenerPorMesYAnio(mes, anio) {
    return await ProductosEstadisticasRepository.findAllByMesYAnio(mes, anio);
  }

  async obtenerKpiPorFecha(fecha) {
    const registros = await ProductosEstadisticasRepository.findByFecha(fecha);

    if (!registros || registros.length === 0) {
      return {
        fecha,
        producto_destacado: {
          id_producto: null,
          nombre: "Sin datos",
          cantidad: 0,
          monto_total: 0,
        },
        total_productos: 0,
      };
    }

    const productoTop = registros.reduce((max, actual) => {
      return actual.cantidad_vendida > max.cantidad_vendida ? actual : max;
    }, registros[0]);

    const total = registros.reduce(
      (acc, r) => acc + parseInt(r.cantidad_vendida),
      0
    );

    let productoInfo = {
      id_producto: productoTop.id_producto,
      cantidad: productoTop.cantidad_vendida,
      monto_total: productoTop.monto_total,
    };

    const producto = await Producto.findByPk(productoTop.id_producto);
    if (producto) {
      productoInfo.nombre = producto.nombre_producto;
    }

    return {
      fecha,
      total_productos: total,
      producto_destacado: productoInfo,
    };
  }

  async getResumenPorFecha(fecha) {
    const registros = await ProductosEstadisticasRepository.findByFecha(fecha);
    const productosAgrupados = {};

    for (const reg of registros) {
      const producto = await Producto.findByPk(reg.id_producto);
      const nombre = producto?.nombre_producto || "Producto Desconocido";

      if (!productosAgrupados[nombre]) {
        productosAgrupados[nombre] = 0;
      }
      productosAgrupados[nombre] += reg.cantidad_vendida;
    }

    return Object.entries(productosAgrupados).map(([name, value]) => ({
      name,
      value,
    }));
  }

  async calcularDatosMensuales(anio, mes) {
    const registros = await ProductosEstadisticasRepository.findAllByMesYAnio(
      mes,
      anio
    );

    const resumen = registros.reduce(
      (acc, prod) => {
        acc.total += parseFloat(prod.monto_total || 0);
        acc.productos += 1;
        return acc;
      },
      { total: 0, productos: 0 }
    );

    return resumen;
  }
}

export default new ProductoEstadisticasService();

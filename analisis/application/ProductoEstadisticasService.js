import { Op, fn, col } from "sequelize";
import DetalleVenta from "../../ventas/domain/models/DetalleVenta.js";
import ProductosEstadisticasRepository from "../infrastructure/repositories/ProductosEstadisticasRepository.js";
import Venta from "../../ventas/domain/models/Venta.js";
import Producto from "../../inventario/domain/models/Producto.js";
import Insumo from "../../inventario/domain/models/Insumo.js";

class ProductoEstadisticasService {
  async generarEstadisticasPorDia(fecha) {
    const inicioDia = `${fecha}T00:00:00`;
    const finDia = `${fecha}T23:59:59.999`;

    const fechaDate = new Date(inicioDia);

    const detallesProductos = await DetalleVenta.findAll({
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
      where: {
        id_producto: { [Op.ne]: null }, // FILTRO que faltaba
        id_insumo: null, // Asegurar que es solo producto
      },
      attributes: [
        "id_producto",
        [fn("SUM", col("cantidad")), "cantidad_vendida"],
        [fn("SUM", col("subtotal")), "monto_total"],
      ],
      group: ["id_producto"],
      raw: true,
    });

    const detallesInsumos = await DetalleVenta.findAll({
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
      where: {
        id_insumo: { [Op.ne]: null },
      },
      attributes: [
        "id_insumo",
        [fn("SUM", col("cantidad")), "cantidad_vendida"],
        [fn("SUM", col("subtotal")), "monto_total"],
      ],
      group: ["id_insumo"],
      raw: true,
    });

    const mes = fechaDate.getMonth() + 1;
    const anio = fechaDate.getFullYear();
    const registros = [];

    for (const d of detallesProductos) {
      const existente =
        await ProductosEstadisticasRepository.findByFechaYProducto(
          fecha,
          d.id_producto
        );

      const data = {
        id_producto: d.id_producto,
        id_insumo: null,
        fecha: fechaDate,
        mes,
        anio,
        cantidad_vendida: parseInt(d.cantidad_vendida),
        monto_total: parseFloat(d.monto_total),
      };

      if (existente) {
        registros.push(
          await ProductosEstadisticasRepository.updateById(existente.id, data)
        );
      } else {
        registros.push(await ProductosEstadisticasRepository.create(data));
      }
    }

    for (const d of detallesInsumos) {
      const existente =
        await ProductosEstadisticasRepository.findByFechaYInsumo(
          fecha,
          d.id_insumo
        );

      const data = {
        id_producto: null,
        id_insumo: d.id_insumo,
        fecha: fechaDate,
        mes,
        anio,
        cantidad_vendida: parseInt(d.cantidad_vendida),
        monto_total: parseFloat(d.monto_total),
      };

      if (existente) {
        registros.push(
          await ProductosEstadisticasRepository.updateById(existente.id, data)
        );
      } else {
        registros.push(await ProductosEstadisticasRepository.create(data));
      }
    }

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
          id_insumo: null,
          nombre: "Sin datos",
          cantidad: 0,
          monto_total: 0,
        },
        total_productos: 0,
      };
    }

    // Buscar el de mayor cantidad vendida
    const productoTop = registros.reduce((max, actual) => {
      return actual.cantidad_vendida > max.cantidad_vendida ? actual : max;
    }, registros[0]);

    const total = registros.reduce(
      (acc, r) => acc + parseInt(r.cantidad_vendida),
      0
    );

    let productoInfo = {
      id_producto: productoTop.id_producto,
      id_insumo: productoTop.id_insumo,
      cantidad: productoTop.cantidad_vendida,
      monto_total: productoTop.monto_total,
      nombre: "Sin nombre", // por defecto
    };

    // Buscar nombre del producto o insumo
    if (productoTop.id_producto) {
      const producto = await Producto.findByPk(productoTop.id_producto);
      if (producto) {
        productoInfo.nombre = producto.nombre_producto;
      }
    } else if (productoTop.id_insumo) {
      const insumo = await Insumo.findByPk(productoTop.id_insumo);
      if (insumo) {
        productoInfo.nombre = insumo.nombre_insumo;
      }
    }

    return {
      fecha,
      total_productos: total,
      producto_destacado: productoInfo,
    };
  }

  async getResumenPorFecha(fecha) {
    const registros = await ProductosEstadisticasRepository.findByFecha(fecha);

    if (!registros || registros.length === 0) {
      return [];
    }
    const productosAgrupados = {};

    for (const reg of registros) {
      let nombre = "Desconocido";

      if (reg.id_producto) {
        const producto = await Producto.findByPk(reg.id_producto);
        nombre = producto?.nombre_producto || "Producto Desconocido";
      } else if (reg.id_insumo) {
        const insumo = await Insumo.findByPk(reg.id_insumo);
        nombre = insumo?.nombre_insumo || "Insumo Desconocido";
      }

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
      (acc, reg) => {
        acc.total += parseFloat(reg.monto_total || 0);
        acc.productos += 1;
        return acc;
      },
      { total: 0, productos: 0 }
    );

    return resumen;
  }
}

export default new ProductoEstadisticasService();

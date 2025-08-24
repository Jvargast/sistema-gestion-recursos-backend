import { Op, fn, col } from "sequelize";
import DetalleVenta from "../../ventas/domain/models/DetalleVenta.js";
import ProductosEstadisticasRepository from "../infrastructure/repositories/ProductosEstadisticasRepository.js";
import Venta from "../../ventas/domain/models/Venta.js";
import Producto from "../../inventario/domain/models/Producto.js";
import Insumo from "../../inventario/domain/models/Insumo.js";
import {
  convertirALaUtc,
  convertirFechaLocal,
} from "../../shared/utils/fechaUtils.js";

class ProductoEstadisticasService {
  async generarEstadisticasPorDia(fechaUtcIso) {
    const fechaChile = convertirFechaLocal(fechaUtcIso);

    const inicioDia = convertirALaUtc(fechaChile.startOf("day")).toDate();
    const finDia = convertirALaUtc(fechaChile.endOf("day")).toDate();
    const fechaStr = fechaChile.format("YYYY-MM-DD");
    const mes = fechaChile.month() + 1;
    const anio = fechaChile.year();

    const detallesProductos = await DetalleVenta.findAll({
      include: [
        {
          model: Venta,
          as: "venta",
          where: { fecha: { [Op.between]: [inicioDia, finDia] } },
          attributes: [], // no duplicar columnas
        },
      ],
      where: { id_producto: { [Op.ne]: null }, id_insumo: null },
      attributes: [
        [col("venta.id_sucursal"), "id_sucursal"],
        "id_producto",
        [fn("SUM", col("cantidad")), "cantidad_vendida"],
        [fn("SUM", col("subtotal")), "monto_total"],
      ],
      group: [col("venta.id_sucursal"), "id_producto"],
      raw: true,
    });

    const detallesInsumos = await DetalleVenta.findAll({
      include: [
        {
          model: Venta,
          as: "venta",
          where: { fecha: { [Op.between]: [inicioDia, finDia] } },
          attributes: [],
        },
      ],
      where: { id_insumo: { [Op.ne]: null } },
      attributes: [
        [col("venta.id_sucursal"), "id_sucursal"],
        "id_insumo",
        [fn("SUM", col("cantidad")), "cantidad_vendida"],
        [fn("SUM", col("subtotal")), "monto_total"],
      ],
      group: [col("venta.id_sucursal"), "id_insumo"],
      raw: true,
    });

    const registros = [];

    for (const d of detallesProductos) {
      const sucId = d.id_sucursal != null ? Number(d.id_sucursal) : null;

      const existente =
        await ProductosEstadisticasRepository.findByFechaYProducto(
          fechaStr,
          d.id_producto,
          { id_sucursal: sucId }
        );

      const data = {
        id_producto: d.id_producto,
        id_insumo: null,
        id_sucursal: sucId,
        fecha: fechaStr,
        mes,
        anio,
        cantidad_vendida: Number(d.cantidad_vendida) || 0,
        monto_total: Number(d.monto_total) || 0,
      };

      registros.push(
        existente
          ? await ProductosEstadisticasRepository.updateById(existente.id, data)
          : await ProductosEstadisticasRepository.create(data)
      );
    }

    for (const d of detallesInsumos) {
      const sucId = d.id_sucursal != null ? Number(d.id_sucursal) : null;

      const existente =
        await ProductosEstadisticasRepository.findByFechaYInsumo(
          fechaStr,
          d.id_insumo,
          { id_sucursal: sucId }
        );

      const data = {
        id_producto: null,
        id_insumo: d.id_insumo,
        id_sucursal: sucId,
        fecha: fechaStr,
        mes,
        anio,
        cantidad_vendida: Number(d.cantidad_vendida) || 0,
        monto_total: Number(d.monto_total) || 0,
      };

      registros.push(
        existente
          ? await ProductosEstadisticasRepository.updateById(existente.id, data)
          : await ProductosEstadisticasRepository.create(data)
      );
    }

    return {
      message: "Estadísticas de productos generadas correctamente",
      count: registros.length,
      registros,
    };
  }

  async obtenerPorMesYAnio(mes, anio, { id_sucursal } = {}) {
    return await ProductosEstadisticasRepository.findAllByMesYAnio(mes, anio, {
      id_sucursal,
    });
  }

  async obtenerKpiPorFecha(fecha, { id_sucursal } = {}) {
    const registros = await ProductosEstadisticasRepository.findByFecha(fecha, {
      id_sucursal,
    });

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
      nombre: "Sin nombre",
    };

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

  async getResumenPorFecha(fecha, { id_sucursal } = {}) {
    const registros = await ProductosEstadisticasRepository.findByFecha(fecha, {
      id_sucursal,
    });

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

  async calcularDatosMensuales(anio, mes, { id_sucursal } = {}) {
    const registros = await ProductosEstadisticasRepository.findAllByMesYAnio(
      mes,
      anio,
      { id_sucursal }
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

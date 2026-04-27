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
import { getWhereEstadoVentaValido } from "../../shared/utils/estadoUtils.js";

class ProductoEstadisticasService {
  buildVentaInclude(inicioDia, finDia) {
    return [
      {
        model: Venta,
        as: "venta",
        where: {
          fecha: { [Op.between]: [inicioDia, finDia] },
          ...getWhereEstadoVentaValido(),
        },
        attributes: [],
      },
    ];
  }

  async loadItemNameMaps(registros) {
    const productoIds = [
      ...new Set(
        registros
          .map((registro) => registro.id_producto)
          .filter((id) => id != null)
          .map(Number)
      ),
    ];
    const insumoIds = [
      ...new Set(
        registros
          .map((registro) => registro.id_insumo)
          .filter((id) => id != null)
          .map(Number)
      ),
    ];

    const [productos, insumos] = await Promise.all([
      productoIds.length
        ? Producto.findAll({
            where: { id_producto: { [Op.in]: productoIds } },
            attributes: ["id_producto", "nombre_producto"],
            raw: true,
          })
        : [],
      insumoIds.length
        ? Insumo.findAll({
            where: { id_insumo: { [Op.in]: insumoIds } },
            attributes: ["id_insumo", "nombre_insumo"],
            raw: true,
          })
        : [],
    ]);

    return {
      productoMap: new Map(
        productos.map((producto) => [
          Number(producto.id_producto),
          producto.nombre_producto,
        ])
      ),
      insumoMap: new Map(
        insumos.map((insumo) => [Number(insumo.id_insumo), insumo.nombre_insumo])
      ),
    };
  }

  resolveItemName(registro, maps) {
    if (registro.id_producto != null) {
      return (
        maps.productoMap.get(Number(registro.id_producto)) ||
        "Producto Desconocido"
      );
    }

    if (registro.id_insumo != null) {
      return (
        maps.insumoMap.get(Number(registro.id_insumo)) || "Insumo Desconocido"
      );
    }

    return "Desconocido";
  }

  async generarEstadisticasPorDia(fechaUtcIso) {
    const fechaChile = convertirFechaLocal(fechaUtcIso);

    const inicioDia = convertirALaUtc(fechaChile.startOf("day")).toDate();
    const finDia = convertirALaUtc(fechaChile.endOf("day")).toDate();
    const fechaStr = fechaChile.format("YYYY-MM-DD");
    const mes = fechaChile.month() + 1;
    const anio = fechaChile.year();

    const detallesProductos = await DetalleVenta.findAll({
      include: this.buildVentaInclude(inicioDia, finDia),
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
      include: this.buildVentaInclude(inicioDia, finDia),
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
        await ProductosEstadisticasRepository.saveByKey({
          fecha: fechaStr,
          id_producto: d.id_producto,
          id_insumo: null,
          id_sucursal: sucId,
          data,
        })
      );
    }

    for (const d of detallesInsumos) {
      const sucId = d.id_sucursal != null ? Number(d.id_sucursal) : null;

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
        await ProductosEstadisticasRepository.saveByKey({
          fecha: fechaStr,
          id_producto: null,
          id_insumo: d.id_insumo,
          id_sucursal: sucId,
          data,
        })
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
      cantidad: Number(productoTop.cantidad_vendida) || 0,
      monto_total: Number(productoTop.monto_total) || 0,
      nombre: "Sin nombre",
    };

    const maps = await this.loadItemNameMaps([productoTop]);
    productoInfo.nombre = this.resolveItemName(productoTop, maps);

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
    const maps = await this.loadItemNameMaps(registros);
    const productosAgrupados = {};

    for (const reg of registros) {
      const nombre = this.resolveItemName(reg, maps);

      if (!productosAgrupados[nombre]) {
        productosAgrupados[nombre] = 0;
      }
      productosAgrupados[nombre] += Number(reg.cantidad_vendida || 0);
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

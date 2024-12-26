import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import DetalleTransaccionService from "../../ventas/application/DetalleTransaccionService.js";
import EstadoTransaccionService from "../../ventas/application/EstadoTransaccionService.js";
import DetalleTransaccionRepository from "../../ventas/infrastructure/repositories/DetalleTransaccionRepository.js";
import TransaccionRepository from "../../ventas/infrastructure/repositories/TransaccionRepository.js";
import ProductoEstadisticaRepository from "../infrastructure/repositories/ProductoEstadisticaRepository.js";

class ProductoEstadisticasService {
  // Crear una estadística para un producto
  async crearEstadisticas(data) {
    return await ProductoEstadisticaRepository.create(data);
  }

  // Obtener estadísticas por ID
  async obtenerEstadisticasPorId(id) {
    const estadisticas = await ProductoEstadisticaRepository.findById(id);
    if (!estadisticas) {
      throw new Error(`No se encontraron estadísticas para el ID ${id}`);
    }
    return estadisticas;
  }

  async obtenerEstadisticasPorProductoYAno(id_producto, year) {
    // Buscar las estadísticas para el producto y año específico
    const estadisticas =
      await ProductoEstadisticaRepository.findByProductoIdAndYear(
        id_producto,
        year
      );

    if (!estadisticas) {
      throw new Error(
        `No se encontraron estadísticas para el producto ID ${id_producto} en el año ${year}.`
      );
    }

    return estadisticas;
  }

  async calcularEstadisticasPorAno(year) {
    // Obtener todos los productos con sus transacciones completadas en el año
    const excludedStates = ["Cancelada", "Rechazada"];
    const estadosPermitidos =
      await EstadoTransaccionService.obtenerEstadosPermitidos(excludedStates);
    const transacciones = await TransaccionRepository.findAllWithConditions({
      where: {
        tipo_transaccion: "venta",
        id_estado_transaccion: {
          [Op.in]: estadosPermitidos.map(
            (estado) => estado.id_estado_transaccion
          ),
        },
        fecha_creacion: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      include: {
        model: DetalleTransaccionRepository.getModel(),
        as: "detalles",
        include: {
          model: Producto,
          as: "producto",
        },
      },
    });

    if (transacciones.length === 0) {
      throw new Error(`No se encontraron transacciones para el año ${year}.`);
    }

    // Calcular estadísticas por producto
    const estadisticasProductos = {};
    transacciones.forEach((transaccion) => {
      transaccion.detalles.forEach((detalle) => {
        const { id_producto, precio_unitario, cantidad } = detalle;
        if (!estadisticasProductos[id_producto]) {
          estadisticasProductos[id_producto] = {
            id_producto,
            year,
            ventas_anuales: 0,
            unidades_vendidas_anuales: 0,
          };
        }

        estadisticasProductos[id_producto].ventas_anuales +=
          precio_unitario * cantidad;
        estadisticasProductos[id_producto].unidades_vendidas_anuales +=
          cantidad;
      });
    });

    // Actualizar o crear las estadísticas en la base de datos
    for (const id_producto in estadisticasProductos) {
      const datos = estadisticasProductos[id_producto];
      const existente =
        await ProductoEstadisticaRepository.findByProductoIdAndYear(
          id_producto,
          year
        );

      if (existente) {
        await ProductoEstadisticaRepository.update(
          existente.id_producto_estadisticas,
          datos
        );
      } else {
        await ProductoEstadisticaRepository.create(datos);
      }
    }

    return Object.values(estadisticasProductos);
  }

  // Obtener estadísticas por producto, año y mes
  async obtenerEstadisticasPorProductoYMes(id_producto, year, month) {
    const estadisticas =
      await ProductoEstadisticaRepository.findByProductoIdAndYear(
        id_producto,
        year
      );
    if (!estadisticas) {
      throw new Error(
        `No se encontraron estadísticas para el producto ${id_producto} en el año ${year}`
      );
    }

    const datosMensuales = estadisticas.datos_mensuales || [];
    const datosMes = datosMensuales[month - 1];

    if (!datosMes) {
      throw new Error(
        `No se encontraron estadísticas para ${year}-${month} del producto ${id_producto}`
      );
    }

    return datosMes;
  }

  // Actualizar estadísticas de un producto por ID
  async actualizarEstadisticas(id, data) {
    const estadisticas = await ProductoEstadisticaRepository.findById(id);
    if (!estadisticas) {
      throw new Error(`No se encontraron estadísticas para el ID ${id}`);
    }
    return await ProductoEstadisticaRepository.updateById(id, data);
  }

  // Calcular estadísticas para un producto por año
  async calcularEstadisticasPorProducto(id_producto, year) {
    // Buscar estadísticas existentes para el producto y año
    let estadisticas =
      await ProductoEstadisticaRepository.findByProductoIdAndYear(
        id_producto,
        year
      );

    // Si no existen estadísticas, crearlas
    if (!estadisticas) {
      estadisticas = await ProductoEstadisticaRepository.create({
        id_producto,
        year,
        ventas_anuales: 0,
        unidades_vendidas_anuales: 0,
        datos_mensuales: Array(12).fill({
          totalVentas: 0,
          unidadesVendidas: 0,
        }),
      });
    }

    // Obtener todos los detalles de transacciones del producto para el año
    const detalles = await DetalleTransaccionService.getAllDetalles({
      where: {
        id_producto,
        createdAt: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lte]: new Date(`${year}-12-31`),
        },
      },
    });

    // Calcular totales
    let ventasAnuales = 0;
    let unidadesVendidasAnuales = 0;
    const datosMensuales = Array(12).fill({
      totalVentas: 0,
      unidadesVendidas: 0,
    });

    detalles.forEach((detalle) => {
      ventasAnuales += detalle.subtotal;
      unidadesVendidasAnuales += detalle.cantidad;

      const month = new Date(detalle.createdAt).getMonth(); // Obtener el mes (0-11)
      datosMensuales[month].totalVentas += detalle.subtotal;
      datosMensuales[month].unidadesVendidas += detalle.cantidad;
    });

    // Actualizar estadísticas
    return await ProductoEstadisticaRepository.updateById(
      estadisticas.id_producto_estadisticas,
      {
        ventas_anuales: ventasAnuales,
        unidades_vendidas_anuales: unidadesVendidasAnuales,
        datos_mensuales: datosMensuales,
      }
    );
  }

  // Obtener todas las estadísticas con paginación
  async obtenerTodasEstadisticas(
    filters = {},
    options = { page: 1, limit: 10 }
  ) {
    const allowedFields = [
      "id_producto_estadisticas",
      "id_producto",
      "year",
      "ventas_anuales",
      "unidades_vendidas_anuales",
      "datos_mensuales",
      "datos_diarios",
    ];

    const where = createFilter(filters, allowedFields);

    const include = [
      {
        model: ProductosRepository.getModel(),
        as: "producto",
        attributes: [
          "id_producto",
          "nombre_producto",
          "marca",
          "activo",
          "id_categoria",
          "id_tipo_producto",
        ],
      },
    ];

    const result = await paginate(
      ProductoEstadisticaRepository.getModel(),
      options,
      {
        where,
        include,
        order: [["id_producto_estadisticas", "ASC"]]
      }
    );
    return result.data;
  }

  // Eliminar estadísticas por ID
  async eliminarEstadisticasPorId(id) {
    const estadisticas = await ProductoEstadisticaRepository.findById(id);
    if (!estadisticas) {
      throw new Error(`No se encontraron estadísticas para el ID ${id}`);
    }
    return await ProductoEstadisticaRepository.deleteById(id);
  }

  async actualizarEstadisticasProducto(id_producto, transacciones) {
    const estadisticas = await ProductoEstadisticaRepository.findByProductoId(
      id_producto
    );

    let ventasTotales = estadisticas?.ventas_anuales || 0;
    let unidadesTotales = estadisticas?.unidades_vendidas_anuales || 0;

    const datosMensuales = estadisticas?.datos_mensuales || {};

    for (const transaccion of transacciones) {
      const mes = new Date(transaccion.fecha).getMonth() + 1;

      ventasTotales += transaccion.subtotal;
      unidadesTotales += transaccion.cantidad;

      if (!datosMensuales[mes]) {
        datosMensuales[mes] = { ventas: 0, unidades: 0 };
      }

      datosMensuales[mes].ventas += transaccion.subtotal;
      datosMensuales[mes].unidades += transaccion.cantidad;
    }

    await ProductoEstadisticaRepository.updateOrCreate({
      id_producto,
      anio: new Date().getFullYear(),
      ventas_anuales: ventasTotales,
      unidades_vendidas_anuales: unidadesTotales,
      datos_mensuales: datosMensuales,
    });
  }

  // Monitorear productos recientes
  async monitorearProductosRecientes() {
    const desde = new Date();
    desde.setHours(desde.getHours() - 1); // Última hora

    const transaccionesRecientes =
      await DetalleTransaccionService.getAllDetalles({
        where: {
          createdAt: { [Op.gte]: desde },
        },
        include: [
          {
            model: Producto,
            as: "producto",
          },
        ],
      });

    if (transaccionesRecientes.length === 0) {
      return "No hay movimientos recientes de productos en la última hora.";
    }

    const productosRecientes = transaccionesRecientes.map((detalle) => ({
      id_producto: detalle.id_producto,
      nombre_producto: detalle.producto.nombre_producto,
      cantidad: detalle.cantidad,
      subtotal: detalle.subtotal,
    }));

    return productosRecientes;
  }
}

export default new ProductoEstadisticasService();

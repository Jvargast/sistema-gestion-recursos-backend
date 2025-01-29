import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import CotizacionRepository from "../infrastructure/repositories/CotizacionRepository.js";
import DetalleCotizacionRepository from "../infrastructure/repositories/DetalleCotizacionRepository.js";
import LogCotizacionRepository from "../infrastructure/repositories/LogCotizacionRepository.js";

class CotizacionService {
  async createCotizacion(data, id_usuario_creador) {
    const { id_cliente, productos, fecha_vencimiento, notas, impuesto, descuento_total_porcentaje } = data;

    // 1. Validaciones iniciales
    const cliente = id_cliente
      ? await ClienteRepository.findById(id_cliente)
      : null;
    const vendedor = await UsuariosRepository.findByRut(id_usuario_creador);

    if (id_cliente && !cliente) {
      throw new Error(`Cliente con ID ${id_cliente} no encontrado.`);
    }
    if (!vendedor) {
      throw new Error(`Vendedor con RUT ${id_usuario_creador} no encontrado.`);
    }

    if (!productos || productos.length === 0) {
      throw new Error("Debe incluir al menos un producto en la cotización.");
    }

    // Obtener la sucursal del vendedor
    const sucursal = vendedor.id_sucursal;
    if (!sucursal) {
      throw new Error(
        `El vendedor con RUT ${id_usuario_creador} no está asociado a ninguna sucursal.`
      );
    }

    // 2. Calcular totales
    let subtotal = 0;
    let descuentoTotalProductos = 0;

    const detalles = productos.map((producto) => {
      const { cantidad, precio_unitario, descuento_porcentaje = 0 } = producto;

      const subtotalProducto = cantidad * precio_unitario;
      const descuentoProducto = (subtotalProducto * descuento_porcentaje) / 100;

      subtotal += subtotalProducto;
      descuentoTotalProductos += descuentoProducto;

      return {
        id_producto: producto.id_producto,
        cantidad,
        precio_unitario,
        descuento: descuentoProducto,
        subtotal: subtotalProducto - descuentoProducto,
      };
    });

    // Aplicar descuento total (si corresponde)
    const descuentoTotalCompra = (subtotal * descuento_total_porcentaje) / 100;
    const descuentoTotal = descuentoTotalProductos + descuentoTotalCompra;

    // Calcular impuestos y total final
    const totalAntesImpuestos = subtotal - descuentoTotal;
    const impuestos_totales = totalAntesImpuestos * (impuesto || 0.19); // 19% por defecto
    const totalConImpuesto = totalAntesImpuestos + impuestos_totales;

    // 3. Registrar la cotización
    const cotizacion = await CotizacionRepository.create({
      id_cliente,
      id_vendedor: id_usuario_creador,
      id_sucursal: sucursal,
      fecha: new Date(),
      fecha_vencimiento,
      total: totalConImpuesto,
      impuestos_totales,
      descuento_total: descuentoTotal,
      estado: "activa", // Estado inicial de la cotización
      notas,
    });

    // 4. Registrar los detalles de la cotización
    for (const detalle of detalles) {
      await DetalleCotizacionRepository.create({
        id_cotizacion: cotizacion.id_cotizacion,
        ...detalle,
      });
    }

    // 5. Registrar en LogCotizacion
    await LogCotizacionRepository.create({
      id_cotizacion: cotizacion.id_cotizacion,
      accion: "creación",
      fecha: new Date(),
      usuario: id_usuario_creador,
      detalle: `Cotización creada con estado inicial 'activa'.`,
    });

    // 5. Retornar la cotización creada con sus detalles
    return {
      cotizacion,
      detalles,
    };
  }
}

export default new CotizacionService();

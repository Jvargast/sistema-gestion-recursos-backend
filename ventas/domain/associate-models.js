import Sucursal from "../../auth/domain/models/Sucursal.js";
import Usuarios from "../../auth/domain/models/Usuarios.js";
import Insumo from "../../inventario/domain/models/Insumo.js";
import Producto from "../../inventario/domain/models/Producto.js";
import Caja from "./models/Caja.js";
import Cliente from "./models/Cliente.js";
import Cotizacion from "./models/Cotizacion.js";
import DetalleCotizacion from "./models/DetalleCotizacion.js";
import DetalleVenta from "./models/DetalleVenta.js";
import Documento from "./models/Documento.js";
import EstadoPago from "./models/EstadoPago.js";
import EstadoVenta from "./models/EstadoVenta.js";
import LogCotizacion from "./models/LogCotizacion.js";
import LogVenta from "./models/LogVenta.js";
import MetodoPago from "./models/MetodoPago.js";
import MovimientoCaja from "./models/MovimientoCaja.js";
import Pago from "./models/Pago.js";
import Venta from "./models/Venta.js";

function loadPOSAssociations() {
  // Relación Caja -> Sucursal
  Caja.belongsTo(Sucursal, { foreignKey: "id_sucursal", as: "sucursal" });
  Sucursal.hasMany(Caja, { foreignKey: "id_sucursal", as: "cajas" });

  // Relación Caja -> Usuarios (Apertura y Cierre)
  Caja.belongsTo(Usuarios, {
    foreignKey: "usuario_apertura",
    as: "usuarioApertura",
  });
  Caja.belongsTo(Usuarios, {
    foreignKey: "usuario_cierre",
    as: "usuarioCierre",
  });
  Caja.belongsTo(Usuarios, {
    foreignKey: "usuario_asignado",
    as: "usuarioAsignado",
  });
  Usuarios.hasMany(Caja, {
    foreignKey: "usuario_apertura",
    as: "cajasAperturadas",
  });
  Usuarios.hasMany(Caja, { foreignKey: "usuario_cierre", as: "cajasCerradas" });
  Usuarios.hasMany(Caja, {
    foreignKey: "usuario_asignado",
    as: "cajasAsignadas",
  });

  // Relación: Cliente -> Venta
  Venta.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
  Cliente.hasMany(Venta, { foreignKey: "id_cliente", as: "ventas" });

  // Relación: Cliente -> Cotizacion
  Cotizacion.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
  Cliente.hasMany(Cotizacion, { foreignKey: "id_cliente", as: "cotizaciones" });

  // Relación: Venta -> DetalleVenta
  DetalleVenta.belongsTo(Venta, { foreignKey: "id_venta", as: "venta" });
  Venta.hasMany(DetalleVenta, { foreignKey: "id_venta", as: "detallesVenta" });

  Venta.belongsTo(Sucursal, { foreignKey: "id_sucursal", as: "sucursal" });
  Sucursal.hasMany(Venta, { foreignKey: "id_sucursal", as: "ventas" });

  Cotizacion.belongsTo(Sucursal, { foreignKey: "id_sucursal", as: "sucursal" });
  Sucursal.hasMany(Cotizacion, {
    foreignKey: "id_sucursal",
    as: "cotizaciones",
  });

  Venta.belongsTo(EstadoVenta, {
    foreignKey: "id_estado_venta",
    as: "estadoVenta",
  });
  EstadoVenta.hasMany(Venta, { foreignKey: "id_estado_venta", as: "ventas" });

  // Relación: Cotizacion -> DetalleCotizacion
  DetalleCotizacion.belongsTo(Cotizacion, {
    foreignKey: "id_cotizacion",
    as: "cotizacion",
  });
  Cotizacion.hasMany(DetalleCotizacion, {
    foreignKey: "id_cotizacion",
    as: "detallesCotizacion",
  });

  // Relación: Producto -> DetalleVenta
  DetalleVenta.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });
  Producto.hasMany(DetalleVenta, {
    foreignKey: "id_producto",
    as: "detallesVenta",
  });

  // Relación: Insumo -> DetalleVenta
  DetalleVenta.belongsTo(Insumo, { foreignKey: "id_insumo", as: "insumo" });
  Insumo.hasMany(DetalleVenta, {
    foreignKey: "id_insumo",
    as: "detallesVenta",
  });

  // Relación: Producto -> DetalleCotizacion
  DetalleCotizacion.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });
  Producto.hasMany(DetalleCotizacion, {
    foreignKey: "id_producto",
    as: "detallesCotizacion",
  });

  // Relación: Caja -> Venta
  Venta.belongsTo(Caja, { foreignKey: "id_caja", as: "caja" });
  Caja.hasMany(Venta, { foreignKey: "id_caja", as: "ventas" });

  // Relación: Caja -> MovimientoCaja
  MovimientoCaja.belongsTo(Caja, { foreignKey: "id_caja", as: "caja" });
  Caja.hasMany(MovimientoCaja, { foreignKey: "id_caja", as: "movimientos" });

  // Relación: MovimientoCaja -> Venta
  MovimientoCaja.belongsTo(Venta, { foreignKey: "id_venta", as: "venta" });
  Venta.hasMany(MovimientoCaja, { foreignKey: "id_venta", as: "movimientos" });

  // Relación: MovimientoCaja -> MetodoPago
  MovimientoCaja.belongsTo(MetodoPago, {
    foreignKey: "id_metodo_pago",
    as: "metodoPago",
  });
  MetodoPago.hasMany(MovimientoCaja, {
    foreignKey: "id_metodo_pago",
    as: "movimientos",
  });
  // Relación: Venta -> Documento
  Documento.belongsTo(Venta, { foreignKey: "id_venta", as: "venta" });
  Venta.hasOne(Documento, { foreignKey: "id_venta", as: "documento" });

  Documento.belongsTo(EstadoPago, {
    foreignKey: "id_estado_pago",
    as: "estadoPago",
  });
  EstadoPago.hasMany(Documento, {
    foreignKey: "id_estado_pago",
    as: "documento",
  });

  // Relación Caja -> Pago
  Caja.hasMany(Pago, { foreignKey: "id_caja", as: "pagos" });
  Pago.belongsTo(Caja, { foreignKey: "id_caja", as: "caja" });

  // Relación: Cliente -> Documento
  Documento.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
  Cliente.hasMany(Documento, { foreignKey: "id_cliente", as: "documentos" });

  Documento.belongsTo(Usuarios, {
    foreignKey: "id_usuario_creador",
    as: "creador",
  });
  Usuarios.hasMany(Documento, {
    foreignKey: "id_usuario_creador",
    as: "documentosCreados",
  });
  // Relación: Venta -> LogVenta
  LogVenta.belongsTo(Venta, { foreignKey: "id_venta", as: "venta" });
  Venta.hasMany(LogVenta, { foreignKey: "id_venta", as: "logs" });

  // Relación: Cotizacion -> LogCotizacion
  LogCotizacion.belongsTo(Cotizacion, {
    foreignKey: "id_cotizacion",
    as: "cotizacion",
  });
  Cotizacion.hasMany(LogCotizacion, {
    foreignKey: "id_cotizacion",
    as: "logs",
  });

  // Relación: Venta -> Pago
  Pago.belongsTo(Venta, { foreignKey: "id_venta", as: "venta" });
  Venta.hasMany(Pago, { foreignKey: "id_venta", as: "pagos" });

  // Relación: Documento -> Pago
  Pago.belongsTo(Documento, { foreignKey: "id_documento", as: "documento" });
  Documento.hasMany(Pago, { foreignKey: "id_documento", as: "pagos" });

  // Relación: MetodoPago -> Pago
  Pago.belongsTo(MetodoPago, {
    foreignKey: "id_metodo_pago",
    as: "metodoPago",
  });
  MetodoPago.hasMany(Pago, { foreignKey: "id_metodo_pago", as: "pagos" });

  // Relación: Pago -> EstadoPago
  Pago.belongsTo(EstadoPago, {
    foreignKey: "id_estado_pago",
    as: "estadoPago",
  });
  EstadoPago.hasMany(Pago, { foreignKey: "id_estado_pago", as: "pagos" });
  // Relación: Venta -> MetodoPago
  Venta.belongsTo(MetodoPago, {
    foreignKey: "id_metodo_pago",
    as: "metodoPago",
  });
  MetodoPago.hasMany(Venta, { foreignKey: "id_metodo_pago", as: "ventas" });

  // Relación: Usuario (vendedor) -> Venta
  Venta.belongsTo(Usuarios, { foreignKey: "id_vendedor", as: "vendedor" });
  Usuarios.hasMany(Venta, { foreignKey: "id_vendedor", as: "ventas" });

  // Relación: Usuario (vendedor) -> Cotizacion
  Cotizacion.belongsTo(Usuarios, { foreignKey: "id_vendedor", as: "vendedor" });
  Usuarios.hasMany(Cotizacion, {
    foreignKey: "id_vendedor",
    as: "cotizaciones",
  });

  // Relación: Usuario (creador) -> LogVenta
  LogVenta.belongsTo(Usuarios, { foreignKey: "usuario", as: "creador" });
  Usuarios.hasMany(LogVenta, { foreignKey: "usuario", as: "logsVentas" });

  // Relación: Usuario (creador) -> LogCotizacion
  LogCotizacion.belongsTo(Usuarios, { foreignKey: "usuario", as: "creador" });
  Usuarios.hasMany(LogCotizacion, {
    foreignKey: "usuario",
    as: "logsCotizaciones",
  });

  console.log("Asociaciones del módulo POS cargadas correctamente.");
}

export default loadPOSAssociations;

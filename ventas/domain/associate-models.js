import Sucursal from "../../auth/domain/models/Sucursal.js";
import Usuarios from "../../auth/domain/models/Usuarios.js";
import InventarioCamionReservas from "../../Entregas/domain/models/InventarioCamionReservas.js";
import Insumo from "../../inventario/domain/models/Insumo.js";
import Producto from "../../inventario/domain/models/Producto.js";
import Caja from "./models/Caja.js";
import Cliente from "./models/Cliente.js";
import Cotizacion from "./models/Cotizacion.js";
import CuentaPorCobrar from "./models/CuentaPorCobrar.js";
import DetalleCotizacion from "./models/DetalleCotizacion.js";
import DetallePedido from "./models/DetallePedido.js";
import DetalleVenta from "./models/DetalleVenta.js";
import Documento from "./models/Documento.js";
import EstadoPago from "./models/EstadoPago.js";
import EstadoVenta from "./models/EstadoVenta.js";
import HistorialCaja from "./models/HistorialCaja.js";
import LogCotizacion from "./models/LogCotizacion.js";
import LogVenta from "./models/LogVenta.js";
import MetodoPago from "./models/MetodoPago.js";
import MovimientoCaja from "./models/MovimientoCaja.js";
import Pago from "./models/Pago.js";
import Pedido from "./models/Pedido.js";
import Venta from "./models/Venta.js";

function loadPOSAssociations() {
  // Relación: Un Pedido pertenece a un Cliente
  Pedido.belongsTo(Cliente, { foreignKey: "id_cliente", as: "Cliente" });
  Cliente.hasMany(Pedido, { foreignKey: "id_cliente", as: "Pedidos" });

  // Pedido → Sucursal
  Pedido.belongsTo(Sucursal, {
    foreignKey: "id_sucursal",
    as: "sucursal",
  });

  // Sucursal → Pedidos
  Sucursal.hasMany(Pedido, {
    foreignKey: "id_sucursal",
    as: "pedidos",
  });

  // Relación: Un Pedido es creado por un Administrador o Vendedor
  Pedido.belongsTo(Usuarios, { foreignKey: "id_creador", as: "Creador" });
  Usuarios.hasMany(Pedido, { foreignKey: "id_creador", as: "PedidosCreados" });

  Pedido.belongsTo(Venta, {
    foreignKey: "id_venta",
    as: "venta",
  });
  Venta.hasOne(Pedido, {
    foreignKey: "id_venta",
    as: "pedido",
  });

  // Relación: Un Pedido puede estar asignado a un Chofer
  Pedido.belongsTo(Usuarios, { foreignKey: "id_chofer", as: "Chofer" });
  Usuarios.hasMany(Pedido, { foreignKey: "id_chofer", as: "PedidosAsignados" });

  // Relación: Un Pedido tiene un Método de Pago
  Pedido.belongsTo(MetodoPago, {
    foreignKey: "id_metodo_pago",
    as: "MetodoPago",
  });
  MetodoPago.hasMany(Pedido, { foreignKey: "id_metodo_pago", as: "Pedidos" });

  // Relación: Un Pedido tiene un Estado
  Pedido.belongsTo(EstadoVenta, {
    foreignKey: "id_estado_pedido",
    as: "EstadoPedido",
  });
  EstadoVenta.hasMany(Pedido, {
    foreignKey: "id_estado_pedido",
    as: "Pedidos",
  });

  Pedido.hasMany(InventarioCamionReservas, {
    foreignKey: "id_pedido",
    as: "reservas",
  });
  InventarioCamionReservas.belongsTo(Pedido, {
    foreignKey: "id_pedido",
  });

  // Relación: Un Pedido tiene muchos Detalles de Pedido (productos)
  Pedido.hasMany(DetallePedido, {
    foreignKey: "id_pedido",
    as: "DetallesPedido",
  });
  DetallePedido.belongsTo(Pedido, { foreignKey: "id_pedido", as: "Pedido" });

  // Relación: Un DetallePedido pertenece a un Producto específico
  DetallePedido.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "Producto",
  });
  DetallePedido.belongsTo(Insumo, {
    foreignKey: "id_insumo",
    as: "Insumo",
  });
  Producto.hasMany(DetallePedido, {
    foreignKey: "id_producto",
    as: "Detalles",
  });
  Insumo.hasMany(DetallePedido, {
    foreignKey: "id_insumo",
    as: "Detalles",
  });

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

  // Relación: Insumo -> DetalleCotizacion
  DetalleCotizacion.belongsTo(Insumo, {
    foreignKey: "id_insumo",
    as: "insumo",
  });
  Insumo.hasMany(DetalleCotizacion, {
    foreignKey: "id_insumo",
    as: "detallesCotizacion",
  });

  Caja.hasMany(HistorialCaja, { foreignKey: "id_caja", as: "historial" });
  HistorialCaja.belongsTo(Caja, { foreignKey: "id_caja", as: "caja" });

  Usuarios.hasMany(HistorialCaja, {
    foreignKey: "usuario_cierre",
    as: "cierres",
  });
  HistorialCaja.belongsTo(Usuarios, {
    foreignKey: "usuario_cierre",
    as: "usuario",
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

  // Relación: Cliente -> Sucursal
  // Modelo (Sequelize)
  Cliente.belongsToMany(Sucursal, {
    through: "ClienteSucursal",
    as: "Sucursales",
    foreignKey: "id_cliente",
  });
  Sucursal.belongsToMany(Cliente, {
    through: "ClienteSucursal",
    as: "Clientes",
    foreignKey: "id_sucursal",
  });
  Pago.belongsTo(Sucursal, { foreignKey: "id_sucursal", as: "Sucursal" });
  CuentaPorCobrar.belongsTo(Sucursal, {
    foreignKey: "id_sucursal",
    as: "Sucursal",
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

  CuentaPorCobrar.belongsTo(Venta, {
    foreignKey: "id_venta",
    as: "venta",
  });

  // CuentaPorCobrar pertenece a un Documento
  CuentaPorCobrar.belongsTo(Documento, {
    foreignKey: "id_documento",
    as: "documento",
  });

  Venta.hasOne(CuentaPorCobrar, {
    foreignKey: "id_venta",
    as: "cuenta_por_cobrar",
  });

  // Documento tiene una CuentaPorCobrar
  Documento.hasOne(CuentaPorCobrar, {
    foreignKey: "id_documento",
    as: "cuenta_por_cobrar",
  });

  console.log("Asociaciones del módulo POS cargadas correctamente.");
}

export default loadPOSAssociations;

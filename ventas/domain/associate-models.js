import Cliente from "./models/Cliente.js";
import Usuarios from "../../auth/domain/models/Usuarios.js";
import Transaccion from "./models/Transaccion.js";
import DetalleTransaccion from "./models/DetalleTransaccion.js";
import LogTransaccion from "./models/LogTransaccion.js";
import Pago from "./models/Pago.js";
import EstadoTransaccion from "./models/EstadoTransaccion.js";
import Producto from "../../inventario/domain/models/Producto.js";
import EstadoPago from "./models/EstadoPago.js";
import MetodoPago from "./models/MetodoPago.js";
import EstadoDetalleTransaccion from "./models/EstadoDetalleTransaccion.js";
import TransicionEstadoTransaccion from "./models/TransicionEstadoTransaccion.js";
import TransicionEstadoDetalle from "./models/TransicionEstadoDetalle.js";
import Factura from "./models/Factura.js";
import Boleta from "./models/Boleta.js";
import Documento from "./models/Documento.js";


function loadSalesAssociations() {
  // Relación: Cliente -> Transacción
  Transaccion.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
  Cliente.hasMany(Transaccion, { foreignKey: "id_cliente", as: "transacciones" });

  // Relación: Usuario -> Transacción
  Transaccion.belongsTo(Usuarios, { foreignKey: "id_usuario", as: "usuario" });
  Usuarios.hasMany(Transaccion, { foreignKey: "id_usuario", as: "transacciones" });

  // Relación: Estado de transacción -> Transacción
  Transaccion.belongsTo(EstadoTransaccion, {
    foreignKey: "id_estado_transaccion",
    as: "estado",
  });
  EstadoTransaccion.hasMany(Transaccion, {
    foreignKey: "id_estado_transaccion",
    as: "transacciones",
  });

  // Relación: Documento -> Transacción
  Documento.belongsTo(Transaccion, { foreignKey: "id_transaccion", as: "transaccion" });
  Transaccion.hasMany(Documento, { foreignKey: "id_transaccion", as: "documentos" });

  // Relación: Cliente -> Documento
  Documento.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
  Cliente.hasMany(Documento, { foreignKey: "id_cliente", as: "documentos" });


  // Relación: Documento -> EstadoPago
  Documento.belongsTo(EstadoPago, { foreignKey: "id_estado_pago", as: "estadoPago" });
  EstadoPago.hasMany(Documento, { foreignKey: "id_estado_pago", as: "documentos" });
  
  // Relación: Documento -> Factura y Boleta
  Documento.hasOne(Factura, { foreignKey: "id_documento", as: "factura" });
  Factura.belongsTo(Documento, { foreignKey: "id_documento", as: "documento" });

  Documento.hasOne(Boleta, { foreignKey: "id_documento", as: "boleta" });
  Boleta.belongsTo(Documento, { foreignKey: "id_documento", as: "documento" });

  // Relación: Pago -> Documento
  Pago.belongsTo(Documento, { foreignKey: "id_documento", as: "documento" });
  Documento.hasMany(Pago, { foreignKey: "id_documento", as: "pagos" });

  // Relación: Pago -> Método de pago
  Pago.belongsTo(MetodoPago, { foreignKey: "id_metodo_pago", as: "metodo" });
  MetodoPago.hasMany(Pago, { foreignKey: "id_metodo_pago", as: "pagos" });

  // Relación: Producto -> Detalle de transacción
  DetalleTransaccion.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });
  Producto.hasMany(DetalleTransaccion, {
    foreignKey: "id_producto",
    as: "detalles",
  });

  // Relación: Transacción -> Detalle de transacción
  DetalleTransaccion.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccion",
  });
  Transaccion.hasMany(DetalleTransaccion, {
    foreignKey: "id_transaccion",
    as: "detalles",
  });

  // Relación: Log de Transacción -> Transacción
  LogTransaccion.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccionLog",
  });
  Transaccion.hasMany(LogTransaccion, {
    foreignKey: "id_transaccion",
    as: "logsTransaccion",
  });

  // Relación: Usuario -> Log de transacción
  LogTransaccion.belongsTo(Usuarios, {
    foreignKey: "id_usuario",
    as: "usuario",
  });
  Usuarios.hasMany(LogTransaccion, { foreignKey: "id_usuario", as: "logs" });

  // Relación: Transición Estado Transacción -> Estados de Transacción
  TransicionEstadoTransaccion.belongsTo(EstadoTransaccion, {
    foreignKey: "id_estado_origen",
    as: "estadoOrigen",
  });
  EstadoTransaccion.hasMany(TransicionEstadoTransaccion, {
    foreignKey: "id_estado_origen",
    as: "transicionesOrigen",
  });

  TransicionEstadoTransaccion.belongsTo(EstadoTransaccion, {
    foreignKey: "id_estado_destino",
    as: "estadoDestino",
  });
  EstadoTransaccion.hasMany(TransicionEstadoTransaccion, {
    foreignKey: "id_estado_destino",
    as: "transicionesDestino",
  });

  // Relación: Detalle Transacción -> Estado Detalle Transacción
  DetalleTransaccion.belongsTo(EstadoDetalleTransaccion, {
    foreignKey: "estado_producto_transaccion",
    as: "estado",
  });
  EstadoDetalleTransaccion.hasMany(DetalleTransaccion, {
    foreignKey: "estado_producto_transaccion",
    as: "detalles_transacciones",
  });

  // Relación: Transición Estado Detalle -> Estado Detalle Transacción (Origen)
  TransicionEstadoDetalle.belongsTo(EstadoDetalleTransaccion, {
    foreignKey: "id_estado_origen",
    as: "estadoOrigen",
  });
  EstadoDetalleTransaccion.hasMany(TransicionEstadoDetalle, {
    foreignKey: "id_estado_origen",
    as: "transicionesOrigen",
  });

  // Relación: Transición Estado Detalle -> Estado Detalle Transacción (Destino)
  TransicionEstadoDetalle.belongsTo(EstadoDetalleTransaccion, {
    foreignKey: "id_estado_destino",
    as: "estadoDestino",
  });
  EstadoDetalleTransaccion.hasMany(TransicionEstadoDetalle, {
    foreignKey: "id_estado_destino",
    as: "transicionesDestino",
  });

  console.log("Asociaciones del módulo de ventas cargadas correctamente.");
}

export default loadSalesAssociations;

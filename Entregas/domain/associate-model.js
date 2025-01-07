import Usuarios from "../../auth/domain/models/Usuarios.js";
import Producto from "../../inventario/domain/models/Producto.js";
import Cliente from "../../ventas/domain/models/Cliente.js";
import DetalleTransaccion from "../../ventas/domain/models/DetalleTransaccion.js";
import Documento from "../../ventas/domain/models/Documento.js";
import MetodoPago from "../../ventas/domain/models/MetodoPago.js";
import AgendaCarga from "./models/AgendaCarga.js";
import Camion from "./models/Camion.js";
import DetallesVentaChofer from "./models/DetallesVentaChofer.js";
import Entrega from "./models/Entrega.js";
import HistorialVentasChofer from "./models/HistorialVentasChofer.js";
import InventarioCamion from "./models/InventarioCamion.js";
import InventarioCamionLogs from "./models/InventarioCamionLogs.js";
import VentasChofer from "./models/VentasChofer.js";

function loadEntregasAssociations(models) {
  // Relación AgendaCarga con Usuario (Chofer)
  AgendaCarga.belongsTo(Usuarios, {
    foreignKey: "id_usuario_chofer",
    as: "usuario",
  });

  Usuarios.hasMany(AgendaCarga, {
    foreignKey: "id_usuario_chofer",
    as: "agendas",
  });

  // Relación AgendaCarga con DetalleTransaccion
  AgendaCarga.hasMany(DetalleTransaccion, {
    foreignKey: "id_agenda_carga",
    as: "detalles",
  });

  DetalleTransaccion.belongsTo(AgendaCarga, {
    foreignKey: "id_agenda_carga",
    as: "agenda",
  });

  // Relación con camión
  AgendaCarga.belongsTo(Camion, {
    foreignKey: "id_camion",
    as: "camion",
  });

  Camion.hasMany(AgendaCarga, {
    foreignKey: "id_camion",
    as: "agendas",
  });

  // Relación Entrega con Usuario (Chofer)
  Entrega.belongsTo(Usuarios, {
    foreignKey: "id_usuario_chofer",
    as: "usuario",
  });

  Usuarios.hasMany(Entrega, {
    foreignKey: "id_usuario_chofer",
    as: "entregas",
  });

  // Relación Entrega con DetalleTransaccion
  Entrega.belongsTo(DetalleTransaccion, {
    foreignKey: "id_detalle_transaccion",
    as: "detalleTransaccion",
  });

  DetalleTransaccion.hasMany(Entrega, {
    foreignKey: "id_detalle_transaccion",
    as: "entregas",
  });

  Camion.hasMany(InventarioCamion, {
    foreignKey: "id_camion",
    as: "inventario",
  });

  InventarioCamion.belongsTo(Camion, {
    foreignKey: "id_camion",
    as: "camion",
  });

  InventarioCamion.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });

  // Relación Camion con InventarioCamionLogs
  Camion.hasMany(InventarioCamionLogs, {
    foreignKey: "id_camion",
    as: "logsInventarioCamion",
  });

  InventarioCamionLogs.belongsTo(Camion, {
    foreignKey: "id_camion",
    as: "camion",
  });

  // Relación Producto con InventarioCamionLogs
  Producto.hasMany(InventarioCamionLogs, {
    foreignKey: "id_producto",
    as: "logsInventarioCamion",
  });

  InventarioCamionLogs.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });

  InventarioCamion.belongsTo(DetalleTransaccion, {
    foreignKey: "id_detalle_transaccion",
    as: "detalleTransaccion",
  });

  DetalleTransaccion.hasMany(InventarioCamion, {
    foreignKey: "id_detalle_transaccion",
    as: "inventarioCamion",
  });

  // VentasChofer tiene muchos DetallesVentaChofer
  VentasChofer.hasMany(DetallesVentaChofer, {
    foreignKey: "id_venta_chofer",
    as: "detallesChofer",
  });
  DetallesVentaChofer.belongsTo(VentasChofer, {
    foreignKey: "id_venta_chofer",
    as: "venta",
  });

  // HistorialVentasChofer pertenece a VentasChofer
  HistorialVentasChofer.belongsTo(VentasChofer, {
    foreignKey: "id_venta_chofer",
    as: "venta",
  });
  VentasChofer.hasOne(HistorialVentasChofer, {
    foreignKey: "id_venta_chofer",
    as: "historial",
  });

  HistorialVentasChofer.belongsTo(Usuarios, {
    foreignKey: "id_chofer",
    as: "chofer",
  });
  Usuarios.hasMany(HistorialVentasChofer, {
    foreignKey: "id_chofer",
    as: "historiales",
  });

  VentasChofer.belongsTo(Cliente, {
    foreignKey: "id_cliente",
    as: "cliente",
  });
  Cliente.hasMany(VentasChofer, {
    foreignKey: "id_cliente",
    as: "ventas",
  });

  VentasChofer.belongsTo(Usuarios, {
    foreignKey: "id_chofer",
    as: "usuario",
  });
  Usuarios.hasMany(VentasChofer, {
    foreignKey: "id_chofer",
    as: "ventas",
  });

  VentasChofer.belongsTo(MetodoPago, {
    foreignKey: "id_metodo_pago",
    as: "metodoPago",
  });
  MetodoPago.hasMany(VentasChofer, {
    foreignKey: "id_metodo_pago",
    as: "ventas",
  });

  VentasChofer.belongsTo(Camion, {
    foreignKey: "id_camion",
    as: "camion",
  });

  Camion.hasMany(VentasChofer, {
    foreignKey: "id_camion",
    as: "ventas",
  });

  DetallesVentaChofer.belongsTo(InventarioCamion, {
    foreignKey: "id_inventario_camion",
    as: "inventarioCamion",
  });
  InventarioCamion.hasMany(DetallesVentaChofer, {
    foreignKey: "id_inventario_camion",
    as: "detallesVentaChofer",
  });

  // Relación: Documento -> VentasChofer
  Documento.belongsTo(VentasChofer, {
    foreignKey: "id_venta_chofer",
    as: "ventasChofer",
  });
  VentasChofer.hasMany(Documento, {
    foreignKey: "id_venta_chofer",
    as: "documentos",
  });

}

export default loadEntregasAssociations;

import Usuarios from "../../auth/domain/models/Usuarios.js";
import Insumo from "../../inventario/domain/models/Insumo.js";
import Producto from "../../inventario/domain/models/Producto.js";
import ProductoRetornable from "../../inventario/domain/models/ProductoRetornable.js";
import Cliente from "../../ventas/domain/models/Cliente.js";
import Documento from "../../ventas/domain/models/Documento.js";
import MetodoPago from "../../ventas/domain/models/MetodoPago.js";
import Pedido from "../../ventas/domain/models/Pedido.js";
import AgendaCarga from "./models/AgendaCarga.js";
import AgendaCargaDetalle from "./models/AgendaCargaDetalle.js";
import AgendaViajes from "./models/AgendaViaje.js";
import Camion from "./models/Camion.js";
import DetallesVentaChofer from "./models/DetallesVentaChofer.js";
import Entrega from "./models/Entrega.js";
import HistorialVentasChofer from "./models/HistorialVentasChofer.js";
import InventarioCamion from "./models/InventarioCamion.js";
import InventarioCamionLogs from "./models/InventarioCamionLogs.js";
import InventarioCamionReservas from "./models/InventarioCamionReservas.js";
import ProductoRetornableCamion from "./models/ProductoRetornableCamion.js";
import VentasChofer from "./models/VentasChofer.js";

function loadEntregasAssociations(models) {
  // Relación AgendaCarga con Usuario (Chofer)
  AgendaCarga.belongsTo(Usuarios, {
    foreignKey: "id_usuario_chofer",
    as: "chofer",
  });
  // Relación con Usuario (creador)
  AgendaCarga.belongsTo(Usuarios, {
    foreignKey: "id_usuario_creador",
    as: "creador",
  });
  // Relación con camión
  AgendaCarga.belongsTo(Camion, {
    foreignKey: "id_camion",
    as: "camion",
  });
  Usuarios.hasMany(AgendaCarga, {
    foreignKey: "id_usuario_chofer",
    as: "agendasComoChofer",
  });

  Usuarios.hasMany(AgendaCarga, {
    foreignKey: "id_usuario_creador",
    as: "agendasCreadas",
  });

  Camion.hasMany(AgendaCarga, {
    foreignKey: "id_camion",
    as: "agendasAsociadas",
  });

  /**
   *
   * Agenda Carga Detalle
   *
   */
  AgendaCargaDetalle.belongsTo(AgendaCarga, {
    foreignKey: "id_agenda_carga",
    as: "carga",
  });

  AgendaCargaDetalle.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });
  AgendaCargaDetalle.belongsTo(Insumo, {
    foreignKey: "id_insumo",
    as: "insumo",
  });

  AgendaCarga.hasMany(AgendaCargaDetalle, {
    foreignKey: "id_agenda_carga",
    as: "detallesCarga",
  });

  Producto.hasMany(AgendaCargaDetalle, {
    foreignKey: "id_producto",
    as: "detallesCargaProducto",
  });

  Insumo.hasMany(AgendaCargaDetalle, {
    foreignKey: "id_insumo",
    as: "detallesCargaInsumo",
  });

  /**
   *
   * AgendaViaje
   *
   */
  AgendaViajes.belongsTo(AgendaCarga, {
    foreignKey: "id_agenda_carga",
    as: "agendaCarga",
  });
  AgendaViajes.belongsTo(Camion, {
    foreignKey: "id_camion",
    as: "camion",
  });
  AgendaViajes.belongsTo(Usuarios, {
    foreignKey: "id_chofer",
    as: "chofer",
  });

  AgendaCarga.hasMany(AgendaViajes, {
    foreignKey: "id_agenda_carga",
    as: "viajes",
  });

  Camion.hasMany(AgendaViajes, {
    foreignKey: "id_camion",
    as: "viajes",
  });

  Usuarios.hasMany(AgendaViajes, {
    foreignKey: "id_chofer",
    as: "viajes",
  });

  /**
   *
   *
   * Camión
   *
   *
   */

  Camion.belongsTo(Usuarios, {
    foreignKey: "id_chofer_asignado",
    as: "chofer",
  });

  Usuarios.hasMany(Camion, {
    foreignKey: "id_chofer_asignado",
    as: "camionesAsignados",
  });

  /**
   *
   *
   * DetallesVentaChofer
   *
   *
   */

  DetallesVentaChofer.belongsTo(VentasChofer, {
    foreignKey: "id_venta_chofer",
    as: "venta",
  });

  DetallesVentaChofer.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });

  VentasChofer.hasMany(DetallesVentaChofer, {
    foreignKey: "id_venta_chofer",
    as: "detallesChofer",
  });

  Producto.hasMany(DetallesVentaChofer, {
    foreignKey: "id_producto",
    as: "detallesProducto",
  });

  /**
   *
   *
   * Entrega
   *
   */
  Entrega.belongsTo(Camion, { foreignKey: "id_camion", as: "camion" });
  Camion.hasMany(Entrega, { foreignKey: "id_camion", as: "entregas" });

  AgendaViajes.hasMany(Entrega, {
    foreignKey: "id_agenda_viaje",
    as: "entregas",
  });
  Entrega.belongsTo(AgendaViajes, {
    foreignKey: "id_agenda_viaje",
    as: "viaje",
  });

  Entrega.belongsTo(Pedido, {
    foreignKey: "id_pedido",
    as: "pedido",
  });
  Pedido.hasMany(Entrega, {
    foreignKey: "id_pedido",
    as: "entregas",
  });

  Entrega.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
  Cliente.hasMany(Entrega, { foreignKey: "id_cliente", as: "entregas" });

  Entrega.belongsTo(Documento, { foreignKey: "id_documento", as: "documento" });
  Documento.hasOne(Entrega, { foreignKey: "id_documento", as: "entrega" });

  // Relación: InventarioCamion -> Camion
  InventarioCamion.belongsTo(Camion, { foreignKey: "id_camion" });
  Camion.hasMany(InventarioCamion, {
    foreignKey: "id_camion",
    as: "inventarioCamion",
  });

  // Relación: InventarioCamion -> Producto e Insumo
  InventarioCamion.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });
  Producto.hasMany(InventarioCamion, {
    foreignKey: "id_producto",
    as: "inventariosProducto",
  });

  InventarioCamion.belongsTo(Insumo, { foreignKey: "id_insumo", as: "insumo" });
  Insumo.hasMany(InventarioCamion, {
    foreignKey: "id_insumo",
    as: "inventariosInsumo",
  });

  // Relación: InventarioCamionLogs -> Camion
  InventarioCamionLogs.belongsTo(Camion, {
    foreignKey: "id_camion",
  });
  Camion.hasMany(InventarioCamionLogs, {
    foreignKey: "id_camion",
    as: "logsInventarioCamion",
  });

  /**
   *
   *
   * HistorialVentasChofer
   *
   */

  HistorialVentasChofer.belongsTo(VentasChofer, {
    foreignKey: "id_venta_chofer",
    as: "venta",
  });
  HistorialVentasChofer.belongsTo(AgendaViajes, {
    foreignKey: "id_agenda_viaje",
    as: "viajes",
  });

  VentasChofer.hasOne(HistorialVentasChofer, {
    foreignKey: "id_venta_chofer",
    as: "historial",
  });

  AgendaViajes.hasMany(HistorialVentasChofer, {
    foreignKey: "id_agenda_viaje",
    as: "viajesAgenda",
  });

  /**
   *
   *
   * Inventario Camion
   *
   */

  InventarioCamion.belongsTo(Camion, {
    foreignKey: "id_camion",
  });

  InventarioCamion.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "productoCamion",
  });

  InventarioCamion.belongsTo(Insumo, {
    foreignKey: "id_insumo",
    as: "insumoCamion",
  });

  InventarioCamion.hasMany(InventarioCamionReservas, {
    foreignKey: "id_inventario_camion",
    as: "reservas",
  });
  InventarioCamionReservas.belongsTo(InventarioCamion, {
    foreignKey: "id_inventario_camion",
  });

  /**
   *
   *
   * Inventario CamionLogs
   *
   */

  InventarioCamionLogs.belongsTo(Camion, {
    foreignKey: "id_camion",
  });
  InventarioCamionLogs.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });
  InventarioCamionLogs.belongsTo(Insumo, {
    foreignKey: "id_insumo",
    as: "insumo",
  });

  Producto.hasMany(InventarioCamionLogs, {
    foreignKey: "id_producto",
    as: "logsProducto",
  });
  Insumo.hasMany(InventarioCamionLogs, {
    foreignKey: "id_insumo",
    as: "logsInsumo",
  });

  /**
   *
   * VentasChofer
   *
   */

  VentasChofer.belongsTo(Camion, {
    foreignKey: "id_camion",
    as: "camion",
  });

  VentasChofer.belongsTo(Cliente, {
    foreignKey: "id_cliente",
    as: "cliente",
  });
  VentasChofer.belongsTo(Usuarios, {
    foreignKey: "id_chofer",
    as: "usuario",
  });
  VentasChofer.belongsTo(MetodoPago, {
    foreignKey: "id_metodo_pago",
    as: "metodoPago",
  });

  Camion.hasMany(VentasChofer, {
    foreignKey: "id_camion",
    as: "ventasCamion",
  });
  Cliente.hasMany(VentasChofer, {
    foreignKey: "id_cliente",
    as: "ventasCliente",
  });

  Usuarios.hasMany(VentasChofer, {
    foreignKey: "id_chofer",
    as: "ventasChofer",
  });

  MetodoPago.hasMany(VentasChofer, {
    foreignKey: "id_metodo_pago",
    as: "ventasMetodoPago",
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

  /**
   * Relaciones con Producto RetornableCamion
   */

  ProductoRetornableCamion.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });
  Producto.hasMany(ProductoRetornableCamion, {
    foreignKey: "id_producto",
    as: "retornablesCamion",
  });

  ProductoRetornableCamion.belongsTo(Camion, {
    foreignKey: "id_camion",
    as: "camion",
  });
  Camion.hasMany(ProductoRetornableCamion, {
    foreignKey: "id_camion",
    as: "retornables",
  });

  ProductoRetornableCamion.belongsTo(Entrega, {
    foreignKey: "id_entrega",
    as: "entrega",
  });

  Entrega.hasMany(ProductoRetornableCamion, {
    foreignKey: "id_entrega",
    as: "retornablesCamion",
  });

  console.log("Asociaciones del módulo de entregas cargadas correctamente.");
}

export default loadEntregasAssociations;

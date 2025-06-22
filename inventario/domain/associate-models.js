import Producto from "./models/Producto.js";
import EstadoProducto from "./models/EstadoProducto.js";
import CategoriaProducto from "./models/CategoriaProducto.js";
import Inventario from "./models/Inventario.js";
import InventarioLog from "./models/InventarioLogs.js";
import Insumo from "./models/Insumo.js";
import TipoInsumo from "./models/TipoInsumo.js";
import ProductoRetornable from "./models/ProductoRetornable.js";
import Venta from "../../ventas/domain/models/Venta.js";
import Camion from "../../Entregas/domain/models/Camion.js";
import FormulaProducto from "./models/FormulaProducto.js";
import FormulaProductoDetalle from "./models/FormulaProductoDetalle.js";

function loadInventarioAssociations() {
  // Relación Producto - EstadoProducto
  Producto.belongsTo(EstadoProducto, {
    foreignKey: "id_estado_producto",
    as: "estadoProducto",
  });
  EstadoProducto.hasMany(Producto, {
    foreignKey: "id_estado_producto",
    as: "productos",
  });

  Producto.hasMany(FormulaProducto, {
    foreignKey: "id_producto_final",
    sourceKey: "id_producto",
  });

  FormulaProducto.belongsTo(Producto, {
    foreignKey: "id_producto_final",
    targetKey: "id_producto",
  });

  // Formula tiene muchos detalles
  FormulaProducto.hasMany(FormulaProductoDetalle, {
    foreignKey: "id_formula",
    sourceKey: "id_formula",
  });

  FormulaProductoDetalle.belongsTo(FormulaProducto, {
    foreignKey: "id_formula",
    targetKey: "id_formula",
  });

  Insumo.hasMany(FormulaProductoDetalle, {
    foreignKey: "id_insumo",
    sourceKey: "id_insumo",
  });

  FormulaProductoDetalle.belongsTo(Insumo, {
    foreignKey: "id_insumo",
    targetKey: "id_insumo",
  });

  // Relación Producto - CategoriaProducto
  Producto.belongsTo(CategoriaProducto, {
    foreignKey: "id_categoria",
    as: "categoria",
  });
  CategoriaProducto.hasMany(Producto, {
    foreignKey: "id_categoria",
    as: "productos",
  });

  // Relación Producto - Inventario (Uno a Uno)
  Producto.hasOne(Inventario, {
    foreignKey: "id_producto",
    as: "inventario",
    onDelete: "CASCADE",
  });
  Inventario.belongsTo(Producto, { foreignKey: "id_producto", as: "producto" });

  // Relación Insumo - Inventario (Uno a Uno)
  Insumo.hasOne(Inventario, {
    foreignKey: "id_insumo",
    as: "inventario",
    onDelete: "CASCADE",
  });
  Inventario.belongsTo(Insumo, { foreignKey: "id_insumo", as: "insumo" });

  // Relación Insumo - Tipo insumo (Uno a Uno)
  TipoInsumo.hasMany(Insumo, {
    foreignKey: "id_tipo_insumo",
    as: "tipo_insumo",
    onDelete: "CASCADE",
  });
  Insumo.belongsTo(TipoInsumo, {
    foreignKey: "id_tipo_insumo",
    as: "tipo_insumo",
  });

  // Relación Producto con BotellonRetornable
  Producto.hasMany(ProductoRetornable, { foreignKey: "id_producto" });
  ProductoRetornable.belongsTo(Producto, { foreignKey: "id_producto" });

  Insumo.hasMany(ProductoRetornable, { foreignKey: "id_insumo" });
  ProductoRetornable.belongsTo(Insumo, { foreignKey: "id_insumo" });

  Venta.hasMany(ProductoRetornable, { foreignKey: "id_venta" });
  ProductoRetornable.belongsTo(Venta, { foreignKey: "id_venta" });

  ProductoRetornable.belongsTo(Camion, { foreignKey: "id_camion", as: "camion" });
  Camion.hasMany(ProductoRetornable, { foreignKey: "id_camion", as: "productosRetornables" });

  /*   ProductoRetornable.belongsTo(EstadoProductoRetornable, {
    foreignKey: "id_estado",
    as: "estadoRetornable",
  });

  EstadoProductoRetornable.hasMany(ProductoRetornable, {
    foreignKey: "id_estado",
    as: "productoRetornable",
  }); */

  // Relación: Producto -> InventarioLog (1:N)
  Producto.hasMany(InventarioLog, {
    foreignKey: "id_producto",
    as: "logs",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  InventarioLog.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  console.log("Asociaciones del módulo de inventario cargadas correctamente.");
}

export default loadInventarioAssociations;

import Producto from "./models/Producto.js";
import EstadoProducto from "./models/EstadoProducto.js";
import CategoriaProducto from "./models/CategoriaProducto.js";
import TipoProducto from "./models/TipoProducto.js";
import Inventario from "./models/Inventario.js";
import TransicionEstadoProducto from "./models/TransicionEstadoProducto.js";
import InventarioLog from "./models/InventarioLogs.js";

function loadInventarioAssociations() {
  // Relación Producto - EstadoProducto
  Producto.belongsTo(EstadoProducto, {
    foreignKey: "id_estado_producto",
    as: "estado",
  });
  EstadoProducto.hasMany(Producto, {
    foreignKey: "id_estado_producto",
    as: "productos",
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
  Inventario.belongsTo(Insumo, { foreignKey: "id_inventario", as: "insumo" });

  // Relación Insumo - Tipo insumo (Uno a Uno)
  TipoInsumo.hasOne(Insumo, {
    foreignKey: "id_tipo_insumo",
    as: "tipo_insumo",
    onDelete: "CASCADE",
  });
  Insumo.belongsTo(TipoInsumo, { foreignKey: "id_tipo_insumo", as: "tipo_insumo" });

  // Relación TransicionEstadoProducto - Producto
  Producto.hasMany(TransicionEstadoProducto, {
    foreignKey: "id_producto",
    as: "transiciones",
  });
  TransicionEstadoProducto.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });

  // Relación TransicionEstadoProducto - EstadoProducto (Origen)
  EstadoProducto.hasMany(TransicionEstadoProducto, {
    foreignKey: "id_estado_origen",
    as: "transicionesOrigen",
  });
  TransicionEstadoProducto.belongsTo(EstadoProducto, {
    foreignKey: "id_estado_origen",
    as: "estadoOrigen",
  });

  // Relación TransicionEstadoProducto - EstadoProducto (Destino)
  EstadoProducto.hasMany(TransicionEstadoProducto, {
    foreignKey: "id_estado_destino",
    as: "transicionesDestino",
  });
  TransicionEstadoProducto.belongsTo(EstadoProducto, {
    foreignKey: "id_estado_destino",
    as: "estadoDestino",
  });

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
}

export default loadInventarioAssociations;

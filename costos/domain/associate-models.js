import Sucursal from "../../auth/domain/models/Sucursal.js";
import Insumo from "../../inventario/domain/models/Insumo.js";
import CategoriaGasto from "./models/CategoriaGasto.js";
import CentroCosto from "./models/CentroCosto.js";
import Compra from "./models/Compra.js";
import CompraItem from "./models/CompraItem.js";
import Gasto from "./models/Gasto.js";
import GastoAdjunto from "./models/GastoAdjunto.js";
import OrdenPago from "./models/OrdenPago.js";
import OrdenPagoItem from "./models/OrdenPagoItem.js";
import Proveedor from "./models/Proveedor.js";

function loadCostosAssociations() {
  // ---------- Proveedor ----------
  Proveedor.hasMany(Compra, { foreignKey: "id_proveedor", as: "compras" });
  Compra.belongsTo(Proveedor, { foreignKey: "id_proveedor", as: "proveedor" });

  Proveedor.hasMany(Gasto, { foreignKey: "id_proveedor", as: "gastos" });
  Gasto.belongsTo(Proveedor, { foreignKey: "id_proveedor", as: "proveedor" });

  Gasto.hasMany(GastoAdjunto, {
    as: "adjuntos",
    foreignKey: "id_gasto",
    onDelete: "CASCADE",
  });
  GastoAdjunto.belongsTo(Gasto, {
    as: "gasto",
    foreignKey: "id_gasto",
  });

  Proveedor.hasMany(OrdenPago, {
    foreignKey: "id_proveedor",
    as: "ordenes_pago",
  });
  OrdenPago.belongsTo(Proveedor, {
    foreignKey: "id_proveedor",
    as: "proveedor",
  });

  // ---------- Sucursal ----------
  Sucursal.hasMany(Compra, { foreignKey: "id_sucursal", as: "compras" });
  Compra.belongsTo(Sucursal, { foreignKey: "id_sucursal", as: "sucursal" });

  Sucursal.hasMany(Gasto, { foreignKey: "id_sucursal", as: "gastos" });
  Gasto.belongsTo(Sucursal, { foreignKey: "id_sucursal", as: "sucursal" });

  Sucursal.hasMany(OrdenPago, {
    foreignKey: "id_sucursal",
    as: "ordenes_pago",
  });
  OrdenPago.belongsTo(Sucursal, { foreignKey: "id_sucursal", as: "sucursal" });

  // ---------- Compra ↔ Items ----------
  Compra.hasMany(CompraItem, {
    foreignKey: "id_compra",
    as: "items",
    onDelete: "CASCADE",
    hooks: true,
  });
  CompraItem.belongsTo(Compra, { foreignKey: "id_compra", as: "compra" });

  // ---------- Item ↔ Insumo ----------
  CompraItem.belongsTo(Insumo, { foreignKey: "id_insumo", as: "insumo" });
  Insumo.hasMany(CompraItem, { foreignKey: "id_insumo", as: "compra_items" });

  // ---------- Gasto ↔ Categoría ----------
  CategoriaGasto.hasMany(Gasto, {
    foreignKey: "id_categoria_gasto",
    as: "gastos",
  });
  Gasto.belongsTo(CategoriaGasto, {
    foreignKey: "id_categoria_gasto",
    as: "categoria",
  });

  // ---------- Gasto ↔ Centro de Costo ----------
  CentroCosto.hasMany(Gasto, { foreignKey: "id_centro_costo", as: "gastos" });
  Gasto.belongsTo(CentroCosto, {
    foreignKey: "id_centro_costo",
    as: "centro_costo",
  });

  // ---------- Orden de Pago (polimórfico) ----------
  Compra.hasMany(OrdenPago, {
    foreignKey: "id_entidad",
    as: "ordenes_pago",
    constraints: false,
    scope: { entidad: "compra" },
  });
  Gasto.hasMany(OrdenPago, {
    foreignKey: "id_entidad",
    as: "ordenes_pago",
    constraints: false,
    scope: { entidad: "gasto" },
  });
  OrdenPago.belongsTo(Compra, {
    foreignKey: "id_entidad",
    constraints: false,
    as: "compra",
  });
  OrdenPago.belongsTo(Gasto, {
    foreignKey: "id_entidad",
    constraints: false,
    as: "gasto",
  });

  OrdenPago.hasMany(OrdenPagoItem, {
    foreignKey: "id_orden_pago",
    as: "items",
    onDelete: "CASCADE",
    hooks: true,
  });
  OrdenPagoItem.belongsTo(OrdenPago, {
    foreignKey: "id_orden_pago",
    as: "orden_pago",
  });

  console.log("Asociaciones del módulo de costo cargadas correctamente.");
}

export default loadCostosAssociations;

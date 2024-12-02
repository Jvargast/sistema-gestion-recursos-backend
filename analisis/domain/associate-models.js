import Producto from "../../inventario/domain/models/Producto.js";
import ProductoEstadisticas from "./models/ProductoEstadisticas.js";
import Transaccion from "../../ventas/domain/models/Transaccion.js";
import VentasEstadisticas from "./models/VentasEstadisticas.js";

function loadAnalysisAssociations() {
  // Relación: Transacción -> VentasEstadisticas
  Transaccion.hasMany(VentasEstadisticas, {
    foreignKey: "id_transaccion",
    as: "estadisticas",
    onDelete: "SET NULL", // Permite eliminar transacciones sin afectar estadísticas
  });

  VentasEstadisticas.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccion",
    onDelete: "SET NULL",
  });

  // Relación: Producto -> ProductoEstadisticas
  Producto.hasMany(ProductoEstadisticas, {
    foreignKey: "id_producto",
    as: "estadisticas",
    onDelete: "SET NULL", // Permite eliminar productos sin afectar estadísticas
  });

  ProductoEstadisticas.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
    onDelete: "SET NULL",
  });

  console.log("Asociaciones del módulo de análisis cargadas");
}

export default loadAnalysisAssociations;

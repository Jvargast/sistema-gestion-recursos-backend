import Producto from "../../inventario/domain/models/Producto.js";
import ProductoEstadisticas from "./models/ProductoEstadisticas.js";
import Transaccion from "../../ventas/domain/models/Transaccion.js";
import VentasEstadisticas from "./models/VentasEstadisticas.js";


function loadAnalysisAssociations() {
  // Relación: Producto -> ProductoEstadisticas (1:N)
  Producto.hasMany(ProductoEstadisticas, {
    foreignKey: "id_producto",
    as: "estadisticas",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  ProductoEstadisticas.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Relación: Transaccion -> VentasEstadisticas (1:N)
  Transaccion.hasMany(VentasEstadisticas, {
    foreignKey: "id_transaccion",
    as: "estadisticas",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  VentasEstadisticas.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccion",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  console.log("Asociaciones del módulo de análisis cargadas");
}

export default loadAnalysisAssociations;

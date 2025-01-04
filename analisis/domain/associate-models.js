import Producto from "../../inventario/domain/models/Producto.js";
import ProductoEstadisticas from "./models/ProductoEstadisticas.js";
import Transaccion from "../../ventas/domain/models/Transaccion.js";
import VentasEstadisticas from "./models/VentasEstadisticas.js";
import EstadisticasTransacciones from "./models/EstadisticasTransacciones.js";

function loadAnalysisAssociations() {
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

  // Relación: VentasEstadisticas -> Transacciones (a través de EstadisticasTransacciones)
  VentasEstadisticas.belongsToMany(Transaccion, {
    through: EstadisticasTransacciones,
    foreignKey: "id_ventas_estadisticas",
    otherKey: "id_transaccion",
    as: "transaccionesRelacionadas",
  });

  Transaccion.belongsToMany(VentasEstadisticas, {
    through: EstadisticasTransacciones,
    foreignKey: "id_transaccion",
    otherKey: "id_ventas_estadisticas",
    as: "estadisticasRelacionadas",
  });

  // Relación directa entre VentasEstadisticas y EstadisticasTransacciones
  VentasEstadisticas.hasMany(EstadisticasTransacciones, {
    foreignKey: "id_ventas_estadisticas",
    as: "estadisticasTransacciones",
  });

  EstadisticasTransacciones.belongsTo(VentasEstadisticas, {
    foreignKey: "id_ventas_estadisticas",
    as: "ventasEstadisticas",
  });

  // Relación directa entre Transaccion y EstadisticasTransacciones
  Transaccion.hasMany(EstadisticasTransacciones, {
    foreignKey: "id_transaccion",
    as: "estadisticasTransacciones",
  });

  EstadisticasTransacciones.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccion",
  });

  console.log("Asociaciones del módulo de análisis cargadas correctamente.");
}

export default loadAnalysisAssociations;

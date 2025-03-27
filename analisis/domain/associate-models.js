import Usuarios from "../../auth/domain/models/Usuarios.js";
import Producto from "../../inventario/domain/models/Producto.js";
import EntregasEstadisticas from "./models/EntregasEstadisticas.js";
import ProductosEstadisticas from "./models/ProductoEstadisticas.js";
import VentasChoferEstadisticas from "./models/VentasChoferEstadisticas.js";


function loadAnalysisAssociations() {
  // Relación: Producto ↔ ProductoEstadisticas
  Producto.hasMany(ProductosEstadisticas, {
    foreignKey: "id_producto",
    as: "estadisticas",
    onDelete: "SET NULL",
  });

  ProductosEstadisticas.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
    onDelete: "SET NULL",
  });

  // Relación: Usuarios (chofer) ↔ VentasChoferEstadisticas
  Usuarios.hasMany(VentasChoferEstadisticas, {
    foreignKey: "id_chofer",
    as: "estadisticasChofer",
  });

  VentasChoferEstadisticas.belongsTo(Usuarios, {
    foreignKey: "id_chofer",
    as: "chofer",
  });

  // Relación: Usuarios (chofer) ↔ EntregasEstadisticas
  Usuarios.hasMany(EntregasEstadisticas, {
    foreignKey: "id_chofer",
    as: "estadisticasEntregas",
  });

  EntregasEstadisticas.belongsTo(Usuarios, {
    foreignKey: "id_chofer",
    as: "chofer",
  });

  console.log("Asociaciones del módulo de análisis cargadas correctamente.");
}

export default loadAnalysisAssociations;

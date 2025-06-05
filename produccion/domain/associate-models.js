import Usuarios from "../../auth/domain/models/Usuarios.js";
import FormulaProducto from "../../inventario/domain/models/FormulaProducto.js";
import Insumo from "../../inventario/domain/models/Insumo.js";
import ConsumoInsumo from "./models/ConsumoInsumo.js";
import Produccion from "./models/Produccion.js";

function loadProduccionAssociations() {
  Produccion.belongsTo(FormulaProducto, {
    foreignKey: "id_formula",
    as: "formula",
  });
  FormulaProducto.hasMany(Produccion, {
    foreignKey: "id_formula",
    as: "lotes", 
  });

  Produccion.belongsTo(Usuarios, {
    foreignKey: "rut_usuario", 
    as: "operario",
  });
  Usuarios.hasMany(Produccion, {
    foreignKey: "rut_usuario",
    as: "producciones",
  });

  Produccion.hasMany(ConsumoInsumo, {
    foreignKey: "id_produccion",
    as: "consumos",
    onDelete: "CASCADE",
  });
  ConsumoInsumo.belongsTo(Produccion, {
    foreignKey: "id_produccion",
    as: "produccion",
  });

  ConsumoInsumo.belongsTo(Insumo, {
    foreignKey: "id_insumo",
    as: "insumo",
  });
  Insumo.hasMany(ConsumoInsumo, {
    foreignKey: "id_insumo",
    as: "consumos",
  });

  console.log("Asociaciones del módulo de producción cargadas correctamente.");
}

export default loadProduccionAssociations;

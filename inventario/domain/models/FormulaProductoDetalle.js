import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import FormulaProducto from "./FormulaProducto.js";
import Insumo from "./Insumo.js";

const FormulaProductoDetalle = sequelize.define(
  "FormulaProductoDetalle",
  {
    id_formula_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_formula: {
      type: DataTypes.INTEGER,
      references: {
        model: FormulaProducto,
        key: "id_formula",
      },
      allowNull: false,
    },
    id_insumo: {
      type: DataTypes.INTEGER,
      references: {
        model: Insumo,
        key: "id_insumo",
      },
      allowNull: false,
    },
    cantidad_requerida: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unidad_de_medida: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "FormulaProductoDetalle",
    timestamps: false,
  }
);
export default FormulaProductoDetalle;

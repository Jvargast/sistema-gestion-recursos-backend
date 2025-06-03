import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "./Producto.js";

const FormulaProducto = sequelize.define(
  "FormulaProducto",
  {
    id_formula: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_formula: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_producto_final: {
      type: DataTypes.INTEGER,
      references: {
        model: Producto,
        key: "id_producto",
      },
      allowNull: false,
    },
    cantidad_requerida: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "FormulaProducto",
    timestamps: false,
  }
);

export default FormulaProducto;

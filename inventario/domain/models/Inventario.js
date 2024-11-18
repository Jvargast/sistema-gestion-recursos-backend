import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "./Producto.js";

const Inventario = sequelize.define(
  "Inventario",
  {
    id_inventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Cantidad inicial por defecto
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: Producto,
        key: "id_producto",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "Inventario",
    timestamps: false,
  }
);

export default Inventario;

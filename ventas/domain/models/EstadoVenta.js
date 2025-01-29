import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EstadoVenta = sequelize.define(
  "EstadoVenta",
  {
    id_estado_venta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "EstadoVenta",
    timestamps: false,
  }
);

export default EstadoVenta;

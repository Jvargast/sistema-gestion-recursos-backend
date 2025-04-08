import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Permisos from "./Permisos.js";


const PermisosDependencias = sequelize.define(
  "PermisosDependencias",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    permisoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permisos,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    dependeDeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permisos,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "PermisosDependencias",
    timestamps: false,
  }
);

export default PermisosDependencias;

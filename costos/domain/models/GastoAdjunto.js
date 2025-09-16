import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Gasto from "./Gasto.js";

const GastoAdjunto = sequelize.define(
  "GastoAdjunto",
  {
    id_adjunto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_gasto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Gasto, key: "id_gasto" },
    },
    original_name: { type: DataTypes.STRING(180), allowNull: true },
    filename: { type: DataTypes.STRING(140), allowNull: false },
    path_rel: { type: DataTypes.STRING(255), allowNull: false }, 
    mimetype: { type: DataTypes.STRING(80), allowNull: true },
    size: { type: DataTypes.INTEGER, allowNull: true }, 
    fecha_subida: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "GastoAdjunto",
    timestamps: false,
    indexes: [{ fields: ["id_gasto"] }],
  }
);

export default GastoAdjunto;

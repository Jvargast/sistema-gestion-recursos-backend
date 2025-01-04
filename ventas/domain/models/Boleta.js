import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const Boleta = sequelize.define(
  "Boleta",
  {
    id_boleta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_documento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Documento",
        key: "id_documento",
      },
    },
  },
  {
    tableName: "Boleta",
    timestamps: false,
  }
);

export default Boleta;

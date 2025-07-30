import { DataTypes } from "sequelize";
import Usuarios from "./Usuarios.js";
import sequelize from "../../../database/database.js";

const UbicacionChofer = sequelize.define(
  "UbicacionChofer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rut: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "UbicacionChofer",
    timestamps: false,
    indexes: [{ fields: ["rut"] }, { fields: ["timestamp"] }],
  }
);

export default UbicacionChofer;

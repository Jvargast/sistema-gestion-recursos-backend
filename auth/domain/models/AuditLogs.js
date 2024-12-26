import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Usuarios from "./Usuarios.js";

const AuditLogs = sequelize.define(
  "AuditLogs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "AuditLogs",
    timestamps: false,
  }
);

export default AuditLogs;

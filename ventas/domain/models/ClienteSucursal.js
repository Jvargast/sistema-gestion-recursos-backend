import { DataTypes } from "sequelize";
import Cliente from "./Cliente.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";
import sequelize from "../../../database/database.js";

const ClienteSucursal = sequelize.define(
  "ClienteSucursal",
  {
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Cliente, key: "id_cliente" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      primaryKey: true,
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Sucursal, key: "id_sucursal" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      primaryKey: true,
    },
  },
  {
    tableName: "ClienteSucursal",
    timestamps: false,
    indexes: [{ unique: true, fields: ["id_cliente", "id_sucursal"] }],
  }
);

export default ClienteSucursal;

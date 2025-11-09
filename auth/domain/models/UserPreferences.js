import { DataTypes } from "sequelize";
import Usuarios from "./Usuarios.js";
import Sucursal from "./Sucursal.js";
import Caja from "../../../ventas/domain/models/Caja.js";
import sequelize from "../../../database/database.js";

const UserPreferences = sequelize.define(
  "UserPreferences",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_rut: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut",
      },
      onDelete: "CASCADE",
      unique: true,
    },
    preferred_vendor_rut: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Usuarios,
        key: "rut",
      },
      onDelete: "SET NULL",
    },
    preferred_branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sucursal,
        key: "id_sucursal",
      },
      onDelete: "SET NULL",
    },
    preferred_cashbox_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Caja,
        key: "id_caja",
      },
      onDelete: "SET NULL",
    },
    pos_sticky: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "UserPreferences",
    timestamps: false,
    indexes: [
      { fields: ["preferred_branch_id"] },
      { fields: ["preferred_cashbox_id"] },
    ],
  }
);

export default UserPreferences;

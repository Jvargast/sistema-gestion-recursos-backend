import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const SecuritySettings = sequelize.define(
  "SecuritySettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    password_min_length: {
      type: DataTypes.INTEGER,
      defaultValue: 8,
      allowNull: false,
    },
    password_require_special: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    password_require_number: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    max_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
    },
    lockout_duration: {
      type: DataTypes.INTEGER, // en minutos
      defaultValue: 15,
      allowNull: false,
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "SecuritySettings",
    timestamps: false,
  }
);

export default SecuritySettings;

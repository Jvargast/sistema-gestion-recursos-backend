import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const PagosEstadisticas = sequelize.define(
  "PagosEstadisticas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_sucursal: { type: DataTypes.INTEGER, allowNull: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    cantidad_pagos: { type: DataTypes.INTEGER, defaultValue: 0 },
    monto_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    metodo_pago: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "PagosEstadisticas",
    timestamps: false,
  }
);

export default PagosEstadisticas;

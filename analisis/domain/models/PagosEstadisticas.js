import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const PagosEstadisticas = sequelize.define(
  "PagosEstadisticas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isInt: true, min: 1 },
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { isDate: true },
    },
    cantidad_pagos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { isInt: true, min: 0 },
    },
    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { isDecimal: true, min: 0 },
    },
    metodo_pago: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "PagosEstadisticas",
    timestamps: false,
    indexes: [
      {
        name: "pagos_estadisticas_fecha_lookup_idx",
        fields: ["fecha", "id_sucursal", "metodo_pago"],
      },
    ],
  }
);

export default PagosEstadisticas;

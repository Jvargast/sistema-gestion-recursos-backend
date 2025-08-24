import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const VentasEstadisticas = sequelize.define(
  "VentasEstadisticas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_sucursal: { type: DataTypes.INTEGER, allowNull: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    mes: { type: DataTypes.INTEGER, allowNull: false }, 
    anio: { type: DataTypes.INTEGER, allowNull: false },
    total_ventas: { type: DataTypes.INTEGER, defaultValue: 0 },
    monto_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    tipo_entrega: {
      type: DataTypes.ENUM(
        "retiro_en_sucursal",
        "despacho_a_domicilio",
        "pedido_pagado_anticipado"
      ),
      allowNull: true,
    },
  },
  {
    tableName: "VentasEstadisticas",
    timestamps: false,
  }
);

export default VentasEstadisticas;

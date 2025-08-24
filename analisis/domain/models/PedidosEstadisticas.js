import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const PedidosEstadisticas = sequelize.define(
  "PedidosEstadisticas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_sucursal: { type: DataTypes.INTEGER, allowNull: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    mes: { type: DataTypes.INTEGER, allowNull: false },
    anio: { type: DataTypes.INTEGER, allowNull: false },
    total_pedidos: { type: DataTypes.INTEGER, defaultValue: 0 },
    pedidos_pagados: { type: DataTypes.INTEGER, defaultValue: 0 },
    monto_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    estado_pago: {
      type: DataTypes.ENUM("Pagado", "Pendiente"),
      allowNull: false,
    },
    id_estado_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "PedidosEstadisticas",
    timestamps: false,
  }
);

export default PedidosEstadisticas;

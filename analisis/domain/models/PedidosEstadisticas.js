import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const PedidosEstadisticas = sequelize.define(
  "PedidosEstadisticas",
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
    mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isInt: true, min: 1, max: 12 },
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isInt: true, min: 2000 },
    },
    total_pedidos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { isInt: true, min: 0 },
    },
    pedidos_pagados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { isInt: true, min: 0 },
    },
    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { isDecimal: true, min: 0 },
    },
    estado_pago: {
      type: DataTypes.ENUM("Pagado", "Pendiente"),
      allowNull: false,
    },
    id_estado_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isInt: true, min: 1 },
    },
  },
  {
    tableName: "PedidosEstadisticas",
    timestamps: false,
    indexes: [
      {
        name: "pedidos_estadisticas_fecha_lookup_idx",
        fields: ["fecha", "id_sucursal", "estado_pago", "id_estado_pedido"],
      },
      {
        name: "pedidos_estadisticas_mes_lookup_idx",
        fields: ["anio", "mes", "id_sucursal"],
      },
    ],
    validate: {
      pedidosPagadosNoExcedenTotal() {
        if (Number(this.pedidos_pagados || 0) > Number(this.total_pedidos || 0)) {
          throw new Error(
            "PedidosEstadisticas no puede tener pedidos_pagados mayores al total"
          );
        }
      },
    },
  }
);

export default PedidosEstadisticas;

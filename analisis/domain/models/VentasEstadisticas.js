import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const VentasEstadisticas = sequelize.define(
  "VentasEstadisticas",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ventas_anuales: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    tipo_transaccion: {
      type: DataTypes.STRING,
      allowNull: false, // venta, factura, cotización, pedido
    },
    unidades_vendidas_anuales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    datos_mensuales: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "VentasEstadisticas",
    timestamps: false,
  }
);

export default VentasEstadisticas;

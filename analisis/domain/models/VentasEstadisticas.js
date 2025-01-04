import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Transaccion from "../../../ventas/domain/models/Transaccion.js";

const VentasEstadisticas = sequelize.define(
  "VentasEstadisticas",
  {
    id_ventas_estadisticas: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ventas_anuales: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
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

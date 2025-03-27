import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const VentasChoferEstadisticas = sequelize.define(
  "VentasChoferEstadisticas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    mes: { type: DataTypes.INTEGER, allowNull: false },
    anio: { type: DataTypes.INTEGER, allowNull: false },
    id_chofer: { type: DataTypes.STRING, allowNull: true },
    total_ventas: { type: DataTypes.INTEGER, defaultValue: 0 },
    monto_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  },
  {
    tableName: "VentasChoferEstadisticas",
    timestamps: false,
  }
);

export default VentasChoferEstadisticas;

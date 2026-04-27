import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const VentasChoferEstadisticas = sequelize.define(
  "VentasChoferEstadisticas",
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
    id_chofer: { type: DataTypes.STRING, allowNull: true },
    total_ventas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { isInt: true, min: 0 },
    },
    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { isDecimal: true, min: 0 },
    },
  },
  {
    tableName: "VentasChoferEstadisticas",
    timestamps: false,
    indexes: [
      {
        name: "ventas_chofer_estadisticas_fecha_lookup_idx",
        fields: ["fecha", "id_sucursal", "id_chofer"],
      },
      {
        name: "ventas_chofer_estadisticas_mes_lookup_idx",
        fields: ["anio", "mes", "id_sucursal"],
      },
    ],
  }
);

export default VentasChoferEstadisticas;

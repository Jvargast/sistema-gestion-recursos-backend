import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EntregasEstadisticas = sequelize.define(
  "EntregasEstadisticas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_sucursal: { type: DataTypes.INTEGER, allowNull: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    mes: { type: DataTypes.INTEGER, allowNull: false },
    anio: { type: DataTypes.INTEGER, allowNull: false },
    id_chofer: { type: DataTypes.STRING, allowNull: true },
    total_entregas: { type: DataTypes.INTEGER, defaultValue: 0 },
    entregas_exitosas: { type: DataTypes.INTEGER, defaultValue: 0 },
    entregas_pendientes: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "EntregasEstadisticas",
    timestamps: false,
  }
);

export default EntregasEstadisticas;

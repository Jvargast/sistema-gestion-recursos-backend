import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EntregasEstadisticas = sequelize.define(
  "EntregasEstadisticas",
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
    total_entregas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { isInt: true, min: 0 },
    },
    entregas_exitosas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { isInt: true, min: 0 },
    },
    entregas_pendientes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { isInt: true, min: 0 },
    },
  },
  {
    tableName: "EntregasEstadisticas",
    timestamps: false,
    indexes: [
      {
        name: "entregas_estadisticas_fecha_lookup_idx",
        fields: ["fecha", "id_sucursal", "id_chofer"],
      },
      {
        name: "entregas_estadisticas_mes_lookup_idx",
        fields: ["anio", "mes", "id_sucursal"],
      },
    ],
    validate: {
      entregasNoExcedenTotal() {
        const exitosas = Number(this.entregas_exitosas || 0);
        const pendientes = Number(this.entregas_pendientes || 0);
        const total = Number(this.total_entregas || 0);

        if (exitosas + pendientes > total) {
          throw new Error(
            "EntregasEstadisticas no puede exceder total_entregas"
          );
        }
      },
    },
  }
);

export default EntregasEstadisticas;

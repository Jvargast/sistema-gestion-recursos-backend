import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import VentasEstadisticas from "./VentasEstadisticas.js";
import Transaccion from "../../../ventas/domain/models/Transaccion.js";

const EstadisticasTransacciones = sequelize.define(
  "EstadisticasTransacciones",
  {
    id_estadisticas_transacciones: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_ventas_estadisticas: {
      type: DataTypes.INTEGER,
      allowNull: false, // Garantizar que siempre esté asociado a una venta estadística
      references: {
        model: VentasEstadisticas, // Referencia directa al modelo
        key: "id_ventas_estadisticas",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    id_transaccion: {
      type: DataTypes.INTEGER,
      allowNull: false, // Garantizar que siempre esté asociado a una transacción
      references: {
        model: Transaccion, // Referencia directa al modelo
        key: "id_transaccion",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "EstadisticasTransacciones",
    timestamps: false,
    indexes: [
      { fields: ["id_ventas_estadisticas"] },
      { fields: ["id_transaccion"] },
    ], // Índices para consultas rápidas
  }
);

export default EstadisticasTransacciones;

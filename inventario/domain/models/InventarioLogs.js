import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "./Producto.js";
import Insumo from "./Insumo.js";

const InventarioLog = sequelize.define(
  "InventarioLog",
  {
    id_log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      references: {
        model: Producto,
        key: "id_producto",
      },
      allowNull: true,
    },
    id_insumo: {
      type: DataTypes.INTEGER,
      references: {
        model: insumo,
        key: "id_insumo",
      },
      allowNull: true,
    },
    id_transaccion: {
      type: DataTypes.INTEGER,
      allowNull: true, // Podría ser opcional si el cambio no está relacionado con una transacción
    },
    cambio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Cantidad ajustada en el inventario (positiva o negativa)",
    },
    cantidad_final: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Cantidad final en el inventario tras el ajuste",
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Razón del cambio (e.g., ingreso, egreso, ajuste, retorno, etc.)",
    },
    realizado_por: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Usuario que realizó el cambio",
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "InventarioLog",
    timestamps: false,
  }
);

export default InventarioLog;

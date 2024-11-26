import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "./Producto.js";

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
      allowNull: false,
    },
    id_transaccion: {
      type: DataTypes.INTEGER,
      allowNull: true, // Podría ser opcional si el cambio no está relacionado con una transacción
    },
    cambio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Cantidad que cambió en el inventario",
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Razón del cambio en el inventario",
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

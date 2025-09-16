import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import OrdenPago from "./OrdenPago.js";

const OrdenPagoItem = sequelize.define(
  "OrdenPagoItem",
  {
    id_orden_pago_item: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_orden_pago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: OrdenPago, key: "id_orden_pago" },
    },
    fecha: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    metodo: { type: DataTypes.STRING, allowNull: false }, // 'efectivo'|'transferencia'|'tarjeta'|'otro'
    monto: { type: DataTypes.INTEGER, allowNull: false }, 
    id_caja: { type: DataTypes.INTEGER, allowNull: true }, 
    id_cuenta_bancaria: { type: DataTypes.INTEGER, allowNull: true }, 
    referencia: { type: DataTypes.STRING, allowNull: true }, 
    observaciones: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "OrdenPagoItem",
    timestamps: false,
    indexes: [{ fields: ["id_orden_pago"] }, { fields: ["fecha"] }],
  }
);

export default OrdenPagoItem;

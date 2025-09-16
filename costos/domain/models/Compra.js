import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Proveedor from "./Proveedor.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";

const Compra = sequelize.define(
  "Compra",
  {
    id_compra: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Proveedor, key: "id_proveedor" },
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Sucursal, key: "id_sucursal" },
    },
    estado: { type: DataTypes.STRING, defaultValue: "borrador" }, // 'borrador','aprobada','recibida','facturada','pagada','anulada'
    subtotal: { type: DataTypes.INTEGER, defaultValue: 0 },
    iva: { type: DataTypes.INTEGER, defaultValue: 0 },
    total: { type: DataTypes.INTEGER, defaultValue: 0 },
    moneda: { type: DataTypes.STRING, defaultValue: "CLP" },
    nro_documento: { type: DataTypes.STRING, allowNull: true },
    fecha_documento: { type: DataTypes.DATEONLY, allowNull: true },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    fecha_de_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "Compra",
    timestamps: false,
    indexes: [
      { fields: ["fecha"] },
      { fields: ["id_sucursal"] },
      { fields: ["estado"] },
    ],
  }
);

export default Compra;

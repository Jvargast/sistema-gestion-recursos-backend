import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Proveedor from "../models/Proveedor.js"; 
import Sucursal from "../../../auth/domain/models/Sucursal.js";


const OrdenPago = sequelize.define(
  "OrdenPago",
  {
    id_orden_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    entidad: { type: DataTypes.STRING, allowNull: false },
    id_entidad: { type: DataTypes.INTEGER, allowNull: false },
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
    fecha: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    estado: { type: DataTypes.STRING, defaultValue: "pendiente" }, // 'pendiente'|'parcial'|'pagada'|'anulada'
    monto_total: { type: DataTypes.INTEGER, allowNull: false }, 
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    fecha_de_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "OrdenPago",
    timestamps: false,
    indexes: [
      { fields: ["entidad", "id_entidad"] },
      { fields: ["id_proveedor"] },
      { fields: ["id_sucursal"] },
      { fields: ["estado"] },
      { fields: ["fecha"] },
    ],
  }
);

export default OrdenPago;

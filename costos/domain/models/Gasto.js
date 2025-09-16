import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import CategoriaGasto from "./CategoriaGasto.js";
import Proveedor from "./Proveedor.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";

const Gasto = sequelize.define(
  "Gasto",
  {
    id_gasto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    id_categoria_gasto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: CategoriaGasto, key: "id_categoria_gasto" },
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Proveedor, key: "id_proveedor" },
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Sucursal, key: "id_sucursal" },
    },
    id_centro_costo: { type: DataTypes.INTEGER, allowNull: true },
    metodo_pago: { type: DataTypes.STRING, allowNull: true }, // 'efectivo','transferencia','tarjeta','otro'
    monto_neto: { type: DataTypes.INTEGER, allowNull: false },
    iva: { type: DataTypes.INTEGER, defaultValue: 0 },
    total: { type: DataTypes.INTEGER, allowNull: false },
    moneda: { type: DataTypes.STRING, defaultValue: "CLP" },
    descripcion: { type: DataTypes.STRING, allowNull: true },
    tipo_documento: { type: DataTypes.STRING, allowNull: true }, // 'boleta','factura','otro'
    nro_documento: { type: DataTypes.STRING, allowNull: true },
    usuario_id: { type: DataTypes.STRING, allowNull: true },
    fecha_de_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "Gasto",
    timestamps: false,
    indexes: [
      { fields: ["fecha"] },
      { fields: ["id_sucursal"] },
      { fields: ["id_centro_costo"] },
      { fields: ["id_categoria_gasto"] },
    ],
  }
);

export default Gasto;

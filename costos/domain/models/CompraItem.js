import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Compra from "./Compra.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";

const CompraItem = sequelize.define(
  "CompraItem",
  {
    id_compra_item: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_compra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Compra, key: "id_compra" },
    },
    id_insumo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Insumo, key: "id_insumo" },
    },
    descripcion: { type: DataTypes.STRING, allowNull: true },
    cantidad: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    precio_unitario: { type: DataTypes.INTEGER, allowNull: false },
    descuento: { type: DataTypes.INTEGER, defaultValue: 0 },
    iva_monto: { type: DataTypes.INTEGER, defaultValue: 0 },
    total: { type: DataTypes.INTEGER, allowNull: false },
    cantidad_recibida: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
  },
  { tableName: "CompraItem", timestamps: false }
);

export default CompraItem;

import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const ProductosEstadisticas = sequelize.define(
  "ProductosEstadisticas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_producto: { type: DataTypes.INTEGER, allowNull: true },
    id_insumo: { type: DataTypes.INTEGER, allowNull: true }, 
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    mes: { type: DataTypes.INTEGER, allowNull: false },
    anio: { type: DataTypes.INTEGER, allowNull: false },
    cantidad_vendida: { type: DataTypes.INTEGER, defaultValue: 0 },
    monto_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  },
  {
    tableName: "ProductosEstadisticas",
    timestamps: false,
  }
);

export default ProductosEstadisticas;

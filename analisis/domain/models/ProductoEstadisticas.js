import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const ProductosEstadisticas = sequelize.define(
  "ProductosEstadisticas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isInt: true, min: 1 },
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isInt: true, min: 1 },
    },
    id_insumo: {
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
    cantidad_vendida: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { isInt: true, min: 0 },
    },
    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { isDecimal: true, min: 0 },
    },
  },
  {
    tableName: "ProductosEstadisticas",
    timestamps: false,
    indexes: [
      {
        name: "productos_estadisticas_producto_fecha_lookup_idx",
        fields: ["fecha", "id_sucursal", "id_producto"],
      },
      {
        name: "productos_estadisticas_insumo_fecha_lookup_idx",
        fields: ["fecha", "id_sucursal", "id_insumo"],
      },
      {
        name: "productos_estadisticas_mes_lookup_idx",
        fields: ["anio", "mes", "id_sucursal"],
      },
    ],
    validate: {
      singleSourceItem() {
        const hasProducto = this.id_producto != null;
        const hasInsumo = this.id_insumo != null;

        if (hasProducto === hasInsumo) {
          throw new Error(
            "ProductosEstadisticas debe tener exactamente uno entre id_producto e id_insumo"
          );
        }
      },
    },
  }
);

export default ProductosEstadisticas;

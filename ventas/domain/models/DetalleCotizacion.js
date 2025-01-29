import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Cotizacion from "./Cotizacion.js";
import Producto from "../../../inventario/domain/models/Producto.js";

const DetalleCotizacion = sequelize.define(
  "DetalleCotizacion",
  {
    id_detalle: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_cotizacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cotizacion,
        key: "id_cotizacion",
      },
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Producto,
        key: "id_producto",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Debe ser al menos 1
      },
    },
    impuesto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    descuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "DetalleCotizacion",
    timestamps: false,
  }
);

export default DetalleCotizacion;

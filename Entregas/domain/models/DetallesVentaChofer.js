// models/DetallesVentaChofer.js
import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import VentasChofer from "./VentasChofer.js";

const DetallesVentaChofer = sequelize.define(
  "DetallesVentaChofer",
  {
    id_detalle_venta: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_venta_chofer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: VentasChofer,
        key: "id_venta_chofer",
      },
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Producto,
        key: "id_producto",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precioUnitario: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    
  },
  {
    tableName: "DetallesVentaChofer",
    timestamps: false,
  }
);

export default DetallesVentaChofer;

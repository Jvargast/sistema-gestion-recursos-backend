// models/DetallesVentaChofer.js
import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import VentasChofer from "./VentasChofer.js";
import InventarioCamion from "./InventarioCamion.js";

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
    id_inventario_camion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InventarioCamion,
        key: "id_inventario_camion",
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
  },
  {
    tableName: "DetallesVentaChofer",
    timestamps: false,
  }
);

export default DetallesVentaChofer;

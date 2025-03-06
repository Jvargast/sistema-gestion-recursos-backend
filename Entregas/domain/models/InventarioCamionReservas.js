import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import InventarioCamion from "./InventarioCamion.js";
import Pedido from "../../../ventas/domain/models/Pedido.js";


const InventarioCamionReservas = sequelize.define(
  "InventarioCamionReservas",
  {
    id_reserva: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_inventario_camion: {
      type: DataTypes.INTEGER,
      references: {
        model: InventarioCamion,
        key: "id_inventario_camion",
      },
      allowNull: true,
      onDelete: "CASCADE",
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      references: {
        model: Pedido,
        key: "id_pedido",
      },
      allowNull: false,
      onDelete: "CASCADE",
    },
    cantidad_reservada: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "Entregado", "Cancelado"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    fecha_reserva: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "InventarioCamionReservas",
    timestamps: false,
  }
);

export default InventarioCamionReservas;

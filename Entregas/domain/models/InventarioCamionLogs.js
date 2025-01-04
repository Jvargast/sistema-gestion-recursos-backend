import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Camion from "./Camion.js";
import Producto from "../../../inventario/domain/models/Producto.js";

const InventarioCamionLogs = sequelize.define(
  "InventarioCamionLogs",
  {
    id_log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_camion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Camion,
        key: "id_camion",
      },
      onDelete: "CASCADE"
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Producto,
        key: "id_producto",
      },
      onDelete: "CASCADE",
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "InventarioCamionLogs",
    tableName: "InventarioCamionLogs",
    timestamps: false, // Opcional si no necesitas `createdAt` y `updatedAt`
  }
);
export default InventarioCamionLogs;

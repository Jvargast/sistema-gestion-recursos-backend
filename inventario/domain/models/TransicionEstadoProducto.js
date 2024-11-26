import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const TransicionEstadoProducto = sequelize.define(
  "TransicionEstadoProducto",
  {
    id_transicion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      references: {
        model: Producto,
        key: "id_producto",
      },
      allowNull: false,
    },
    id_estado_origen: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoProducto,
        key: "id_estado_producto",
      },
      allowNull: false,
    },
    id_estado_destino: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoProducto,
        key: "id_estado_producto",
      },
      allowNull: false,
    },
    fecha_transicion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    id_usuario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    condicion: {
      type: DataTypes.STRING, // Condición bajo la cual se permite la transición
      allowNull: true,
    },
    comentarios: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "TransicionEstadoProducto",
    timestamps: false,
  }
);

export default TransicionEstadoProducto;

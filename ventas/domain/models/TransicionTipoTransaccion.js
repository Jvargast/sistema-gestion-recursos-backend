import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import EstadoTransaccion from "./EstadoTransaccion.js";

const TransicionTipoTransaccion = sequelize.define(
  "TransicionTipoTransaccion",
  {
    id_transicion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo_origen: {
      type: DataTypes.ENUM("cotizacion", "pedido", "venta"),
      allowNull: false,
    },
    tipo_destino: {
      type: DataTypes.ENUM("cotizacion", "pedido", "venta"),
      allowNull: false,
    },
    estado_origen: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoTransaccion,
        key: "id_estado_transaccion",
      },
      allowNull: false,
    },
    estado_destino: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoTransaccion,
        key: "id_estado_transaccion",
      },
      allowNull: false,
    },
    condicion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Condiciones específicas para validar la transición",
    },
  },
  {
    tableName: "TransicionTipoTransaccion",
    timestamps: false,
  }
);

export default TransicionTipoTransaccion;

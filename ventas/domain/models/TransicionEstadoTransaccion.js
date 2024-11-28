import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import EstadoTransaccion from "./EstadoTransaccion.js";
import Transaccion from "./Transaccion.js";

const TransicionEstadoTransaccion = sequelize.define(
  "TransicionEstadoTransaccion",
  {
    id_transicion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_estado_origen: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoTransaccion,
        key: "id_estado_transaccion",
      },
    },
    id_estado_destino: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoTransaccion,
        key: "id_estado_transaccion",
      },
    },
    condicion: {
      type: DataTypes.STRING, // Condición de negocio
      allowNull: true,
    },
  },
  {
    tableName: "TransicionEstadoTransaccion",
    timestamps: false,
  }
);

export default TransicionEstadoTransaccion;

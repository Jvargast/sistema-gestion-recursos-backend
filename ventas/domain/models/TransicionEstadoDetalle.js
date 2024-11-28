import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import EstadoDetalleTransaccion from "./EstadoDetalleTransaccion.js";
import DetalleTransaccion from "./DetalleTransaccion.js";

const TransicionEstadoDetalle = sequelize.define("TransicionEstadoDetalle", {
  id_transicion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_estado_origen: {
    type: DataTypes.INTEGER,
    references: {
      model: EstadoDetalleTransaccion,
      key: "id_estado_detalle_transaccion",
    },
    allowNull: false,
  },
  id_estado_destino: {
    type: DataTypes.INTEGER,
    references: {
      model: EstadoDetalleTransaccion,
      key: "id_estado_detalle_transaccion",
    },
    allowNull: false,
  },
  condicion: {
    type: DataTypes.STRING,
    allowNull: true, // Puede definir condiciones adicionales para la transición
  },
}, {
  tableName: "TransicionEstadoDetalle",
  timestamps: false,
});

export default TransicionEstadoDetalle;

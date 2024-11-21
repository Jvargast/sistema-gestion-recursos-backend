import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Transaccion from "./Transaccion.js";
import EstadoPago from "./EstadoPago.js";
import MetodoPago from "./MetodoPago.js";

const Pago = sequelize.define(
  "Pago",
  {
    id_pago: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_transaccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Transaccion,
        key: "id_transaccion",
      },
    },
    id_estado_pago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: EstadoPago,
        key: "id_estado_pago",
      },
    },
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MetodoPago,
        key: "id_metodo_pago",
      },
    },
    monto: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    fecha_pago: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    referencia: {
      type: DataTypes.STRING, // Código de referencia de transferencia o tarjeta
      allowNull: true,
    },
  },
  {
    tableName: "Pago",
    timestamps: false,
  }
);

export default Pago;

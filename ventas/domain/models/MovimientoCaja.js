import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Caja from "./Caja.js";
import MetodoPago from "./MetodoPago.js";
import Venta from "./Venta.js";

const MovimientoCaja = sequelize.define(
  "MovimientoCaja",
  {
    id_movimiento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_caja: {
      type: DataTypes.INTEGER,
      references: {
        model: Caja,
        key: "id_caja",
      },
      allowNull: false,
    },
    tipo_movimiento: {
      type: DataTypes.ENUM("ingreso", "egreso"),
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    saldo_caja: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_movimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MetodoPago,
        key: "id_metodo_pago",
      },
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Venta,
        key: "id_venta",
      },
    },
  },
  {
    tableName: "MovimientoCaja",
    timestamps: false,
  }
);

export default MovimientoCaja;

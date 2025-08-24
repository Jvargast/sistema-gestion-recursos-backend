import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Venta from "./Venta.js";
import Documento from "./Documento.js";
import MetodoPago from "./MetodoPago.js";
import EstadoPago from "./EstadoPago.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";

const Pago = sequelize.define(
  "Pago",
  {
    id_pago: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Venta,
        key: "id_venta",
      },
    },
    id_documento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Documento,
        key: "id_documento",
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
    id_estado_pago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: EstadoPago,
        key: "id_estado_pago",
      },
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Sucursal, key: "id_sucursal" },
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    referencia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Pago",
    timestamps: false,
    indexes: [
      { fields: ["id_sucursal"] },
      { fields: ["fecha_pago"] },
      { fields: ["id_sucursal", "fecha_pago"] },
    ],
  }
);

export default Pago;

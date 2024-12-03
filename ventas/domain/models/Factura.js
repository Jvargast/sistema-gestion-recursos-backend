import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import EstadoFactura from "./EstadoFactura.js";

const Factura = sequelize.define("Factura", {
  id_factura: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero_factura: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  fecha_emision: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  id_estado_factura: {
    type: DataTypes.INTEGER,
    references: {
      model: EstadoFactura,
      key: "id_estado_factura",
    },
    allowNull: false,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default Factura;
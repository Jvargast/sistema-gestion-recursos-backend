import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const MetodoPago = sequelize.define(
  "Metodo_Pago",
  {
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING, // Ejemplo: "efectivo", "tarjeta_credito", "transferencia"
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "MetodoPago",
    timestamps: false,
  }
);

export default MetodoPago;

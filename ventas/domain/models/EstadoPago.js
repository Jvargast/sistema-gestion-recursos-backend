import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EstadoPago = sequelize.define(
  "Estado_Pago",
  {
    id_estado_pago: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING, // Ejemplo: "pendiente", "pagado", "rechazado"
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Estado_Pago",
    timestamps: false,
  }
);

export default EstadoPago;

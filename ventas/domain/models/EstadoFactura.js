import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EstadoFactura = sequelize.define(
  "Estado_Factura",
  {
    id_estado_factura: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Estado_Factura",
    timestamps: false,
  }
);

export default EstadoFactura;

import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EstadoDetalleTransaccion = sequelize.define(
  "Estado_Detalle_Transaccion",
  {
    id_estado_detalle_transaccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Estado_Detalle_Transaccion",
    timestamps: false,
  }
);

export default EstadoDetalleTransaccion;

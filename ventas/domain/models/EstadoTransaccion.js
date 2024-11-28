import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EstadoTransaccion = sequelize.define(
  "Estado_Transaccion",
  {
    id_estado_transaccion: {
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
    tipo_transaccion: {
      type: DataTypes.STRING,
      allowNull: false, // Por ejemplo: 'venta', 'pedido', 'cotizacion'
    },
    es_inicial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Por defecto, no es inicial
    },
  },
  {
    tableName: "Estado_Transaccion",
    timestamps: false,
  }
);

export default EstadoTransaccion;

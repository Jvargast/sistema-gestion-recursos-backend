import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Transaccion from "./Transaccion.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const LogTransaccion = sequelize.define(
  "Log_Transaccion",
  {
    id_log: {
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
    id_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    accion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    detalles: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_modificacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Log_Transaccion",
  }
);

export default LogTransaccion;

import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Cotizacion from "./Cotizacion.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const LogCotizacion = sequelize.define(
  "LogCotizacion",
  {
    id_log: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_cotizacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cotizacion,
        key: "id_cotizacion"
      }
    },
    accion: {
      type: DataTypes.ENUM("creación", "modificación", "anulación", "vencimiento", "otros"),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut"
      }
    },
    detalle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cambios: {
      type: DataTypes.JSON,
      allowNull: true, // JSON para registrar cambios específicos realizados
    },
  },
  {
    tableName: "LogCotizacion",
    timestamps: false,
  }
);

export default LogCotizacion;

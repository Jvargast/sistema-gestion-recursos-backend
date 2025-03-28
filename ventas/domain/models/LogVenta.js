import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Venta from "./Venta.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const LogVenta = sequelize.define(
  "LogVenta",
  {
    id_log: {
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
    accion: {
      type: DataTypes.ENUM("creación", "modificación", "cancelación", "anulación", "otros"),
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
        key: "rut",
      },
    },
    detalle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cambios: {
      type: DataTypes.JSON,
      allowNull: true, // JSON opcional para guardar detalles de los cambios realizados
    },
  },
  {
    tableName: "LogVenta",
  }
);

export default LogVenta;

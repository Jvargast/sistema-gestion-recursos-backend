import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Caja from "./Caja.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";


const HistorialCaja = sequelize.define(
  "HistorialCaja",
  {
    id_historial: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_caja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Caja,
        key: "id_caja",
      },
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sucursal,
        key: "id_sucursal",
      },
    },
    fecha_cierre: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    saldo_final: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    usuario_cierre: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "HistorialCaja",
    timestamps: false,
  }
);

export default HistorialCaja;

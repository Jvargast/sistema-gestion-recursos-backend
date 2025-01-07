// models/HistorialVentasChofer.js

import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import VentasChofer from "./VentasChofer.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const HistorialVentasChofer = sequelize.define(
  "HistorialVentasChofer",
  {
    id_venta_chofer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: VentasChofer,
        key: "id_venta_chofer"
      }
    },
    id_chofer: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut"
      }
    },
    fechaSincronizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estadoSincronizacion: {
      type: DataTypes.ENUM("pendiente", "sincronizado"),
      allowNull: false,
    },
  },
  {
    tableName: "HistorialVentasChofer",
    timestamps: false,
  }
);

export default HistorialVentasChofer;
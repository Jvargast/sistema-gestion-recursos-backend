// models/HistorialVentasChofer.js

import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import VentasChofer from "./VentasChofer.js";
import AgendaViajes from "./AgendaViaje.js";

const HistorialVentasChofer = sequelize.define(
  "HistorialVentasChofer",
  {
    id_historial_venta_chofer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    id_venta_chofer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: VentasChofer,
        key: "id_venta_chofer",
      },
    },
    id_agenda_viaje: {
      type: DataTypes.INTEGER,
      references: {
        model: AgendaViajes,
        key: "id_agenda_viaje",
      },
    },
    fecha_sincronizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado_sincronizacion: {
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

import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Camion from "./Camion.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";

const AgendaCarga = sequelize.define(
  "AgendaCarga",
  {
    id_agenda_carga: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sucursal,
        key: "id_sucursal",
      },
    },
    id_usuario_chofer: {
      type: DataTypes.STRING,
      references: {
        model: Usuarios,
        key: "rut",
      },
      allowNull: false,
    },
    id_usuario_creador: {
      type: DataTypes.STRING,
      references: {
        model: Usuarios,
        key: "rut",
      },
      allowNull: false,
    },
    id_camion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Camion, key: "id_camion" },
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "Completada", "Cancelada", "Cargado"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    prioridad: {
      type: DataTypes.ENUM("Alta", "Media", "Baja"),
      allowNull: false,
      defaultValue: "Media",
    },
    hora_estimacion_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    validada_por_chofer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "AgendaCarga",
    timestamps: false,
    indexes: [{ fields: ["id_sucursal"] }],
  }
);

export default AgendaCarga;

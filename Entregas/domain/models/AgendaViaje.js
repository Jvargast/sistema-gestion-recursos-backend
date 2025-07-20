import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import AgendaCarga from "./AgendaCarga.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Camion from "./Camion.js";

const AgendaViajes = sequelize.define(
  "AgendaViajes",
  {
    id_agenda_viaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_agenda_carga: {
      type: DataTypes.INTEGER,
      references: {
        model: AgendaCarga,
        key: "id_agenda_carga",
      },
    },
    id_camion: {
      type: DataTypes.INTEGER,
      references: {
        model: Camion,
        key: "id_camion",
      },
    },
    id_chofer: {
      type: DataTypes.STRING,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    inventario_inicial: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    inventario_final: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    origen_inicial: {
      type: DataTypes.JSON, 
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "En Tránsito", "Finalizado"),
      defaultValue: "Pendiente",
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    destinos: {
      type: DataTypes.JSON, // Ejemplo: [{"cliente": 1, "direccion": "Calle 123"}, ...]
      allowNull: true,
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validado_por_chofer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "AgendaViajes",
    timestamps: false,
  }
);

export default AgendaViajes;

import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const Camion = sequelize.define(
  "Camion",
  {
    id_camion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    placa: {
      type: DataTypes.STRING,
      allowNull: false, // Identificador único del camión (placa)
    },
    ubicacion_actual: {
      type: DataTypes.STRING,
      allowNull: true, // Ejemplo: "lat,long" o "Ciudad, País".
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false, // Capacidad del camión (en unidades o peso)
    },
    estado: {
      type: DataTypes.ENUM("Disponible", "En Ruta", "Mantenimiento"),
      defaultValue: "Disponible",
    },
    id_chofer_asignado: {
      type: DataTypes.STRING,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
  },
  {
    tableName: "Camion",
    timestamps: false,
  }
);

export default Camion;

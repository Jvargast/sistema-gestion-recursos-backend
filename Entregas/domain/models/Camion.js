import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";

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
      allowNull: false,
    },
    ubicacion_actual: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Sucursal, key: "id_sucursal" },
    },
  },
  {
    tableName: "Camion",
    timestamps: false,
  }
);

export default Camion;

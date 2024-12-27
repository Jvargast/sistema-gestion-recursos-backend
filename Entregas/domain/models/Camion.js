import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const Camion = sequelize.define("Camion", {
  id_camion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  placa: {
    type: DataTypes.STRING,
    allowNull: false, // Identificador único del camión (placa)
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false, // Capacidad del camión (en unidades o peso)
  },
  estado: {
    type: DataTypes.ENUM("Disponible", "En Ruta", "Mantenimiento"),
    defaultValue: "Disponible",
  },
});


export default Camion
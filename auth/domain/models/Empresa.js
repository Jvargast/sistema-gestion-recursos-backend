import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const Empresa = sequelize.define(
  "Empresa",
  {
    id_empresa: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    rut_empresa: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "Empresas",
    timestamps: true, // createdAt, updatedAt
  }
);

export default Empresa;

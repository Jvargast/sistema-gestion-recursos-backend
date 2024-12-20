import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Empresa from "./Empresa.js";

const Sucursal = sequelize.define(
  "Sucursal",
  {
    id_sucursal: {
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
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Empresa,
        key: "id_empresa",
      },
    },
  },
  {
    tableName: "Sucursales",
    timestamps: true, // createdAt, updatedAt
  }
);

export default Sucursal;

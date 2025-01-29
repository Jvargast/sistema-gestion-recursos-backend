import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Roles from "./Roles.js";
import Empresa from "./Empresa.js";
import Sucursal from "./Sucursal.js";

const Usuarios = sequelize.define(
  "Usuarios",
  {
    rut: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ultimo_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rolId: {
      type: DataTypes.INTEGER,
      references: {
        model: Roles,
        key: "id",
      },
      allowNull: false, // Cada usuario debe tener un rol asignado
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      references: {
        model: Empresa,
        key: "id_empresa",
      },
      allowNull: false,
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      references: {
        model: Sucursal,
        key: "id_sucursal",
      },
      allowNull: true, // Puede ser opcional si el usuario no está asignado a ninguna sucursal específica
    },
    // Campo para almacenar Refresh Tokens
    refreshTokens: {
      type: DataTypes.TEXT, // Almacena un array de tokens en formato JSON
      allowNull: true, // Inicialmente vacío
    },
  },
  {
    tableName: "Usuarios",
    timestamps: false,
  }
);

export default Usuarios;

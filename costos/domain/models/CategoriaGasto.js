import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const CategoriaGasto = sequelize.define(
  "CategoriaGasto",
  {
    id_categoria_gasto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_categoria: { type: DataTypes.STRING, allowNull: false },
    tipo_categoria: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: true },
    deducible: { type: DataTypes.BOOLEAN, defaultValue: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    fecha_de_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "CategoriaGasto", timestamps: false }
);

export default CategoriaGasto;

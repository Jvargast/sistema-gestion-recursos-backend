import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const CentroCosto = sequelize.define(
  "CentroCosto",
  {
    id_centro_costo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.STRING, allowNull: false },
    ref_id: { type: DataTypes.INTEGER, allowNull: true },
    id_sucursal: { type: DataTypes.INTEGER, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    fecha_de_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "CentroCosto", timestamps: false }
);

export default CentroCosto;

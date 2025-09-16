import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const Proveedor = sequelize.define(
  "Proveedor",
  {
    id_proveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rut: { type: DataTypes.STRING, unique: true, allowNull: true },
    razon_social: { type: DataTypes.STRING, allowNull: false },
    giro: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    telefono: { type: DataTypes.STRING, allowNull: true },
    direccion: { type: DataTypes.STRING, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    fecha_de_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "Proveedor", timestamps: false }
);

export default Proveedor;

import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const Insumo = sequelize.define(
  "Insumo",
  {
    id_insumo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_insumo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    codigo_barra: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    id_tipo_insumo: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoInsumo,
        key: "id_tipo_insumo",
      },
      allowNull: false,
    },
    es_para_venta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Por defecto, no se venden.
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Solo aplica si el insumo se vende.
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    fecha_de_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Insumo",
    timestamps: false,
  }
);
export default Insumo;

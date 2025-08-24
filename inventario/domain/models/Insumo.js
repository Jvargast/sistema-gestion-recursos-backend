import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import TipoInsumo from "./TipoInsumo.js";

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
    image_url: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    es_para_venta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, 
    },
    unidad_de_medida: {
      type: DataTypes.STRING,
      allowNull: true
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

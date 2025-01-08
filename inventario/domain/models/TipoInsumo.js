import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';

const TipoInsumo = sequelize.define(
  "TipoInsumo",
  {
    id_tipo_insumo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "TipoInsumo",
    timestamps: false,
  }
 );
 export default TipoInsumo;
import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';

const CategoriaProducto = sequelize.define('CategoriaProducto', {
  id_categoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'CategoriaProducto',
  timestamps: false,
});

export default CategoriaProducto;

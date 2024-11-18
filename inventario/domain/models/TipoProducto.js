import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';

const TipoProducto = sequelize.define('TipoProducto', {
  id_tipo_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'TipoProducto',
  timestamps: false,
});

export default TipoProducto;

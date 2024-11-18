import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';

const EstadoProducto = sequelize.define('EstadoProducto', {
  id_estado_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'EstadoProducto',
  timestamps: false,
});

export default EstadoProducto;

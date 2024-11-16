import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database';

const Roles = sequelize.define('Roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },

}, {
  tableName: 'Roles', 
  timestamps: true,
});

export default Roles;
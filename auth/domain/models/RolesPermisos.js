import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';
import Roles from './Roles.js';
import Permisos from './Permisos.js';

const RolesPermisos = sequelize.define('RolesPermisos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rolId: {
    type: DataTypes.INTEGER,
    references: {
      model: Roles,
      key: 'id',
    },
    allowNull: false,
  },
  permisoId: {
    type: DataTypes.INTEGER,
    references: {
      model: Permisos,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  timestamps: false, 
});

export default RolesPermisos;
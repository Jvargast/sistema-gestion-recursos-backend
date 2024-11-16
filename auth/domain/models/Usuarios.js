import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database';

const Usuarios = sequelize.define('Usuarios', {
  rut: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  rolId: {
    type: DataTypes.INTEGER,
    references: {
      model: Roles,
      key: 'id',
    },
    allowNull: false, // Cada usuario debe tener un rol asignado
  },
}, {
  tableName: 'Usuarios', 
  timestamps: false, 
});

export default Usuarios;
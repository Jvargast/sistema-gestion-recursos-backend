import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';
import EstadoProducto from './EstadoProducto.js';
import CategoriaProducto from './CategoriaProducto.js';
import TipoProducto from './TipoProducto.js';

const Producto = sequelize.define('Producto', {
  id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_producto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  codigo_barra: {
    type: DataTypes.STRING,
    unique: true, // Garantiza que no se repitan los códigos de barra
    allowNull: true, // Puede no ser obligatorio para algunos productos
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha_de_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    references: {
      model: CategoriaProducto,
      key: 'id_categoria',
    },
  },
  id_tipo_producto: {
    type: DataTypes.INTEGER,
    references: {
      model: TipoProducto,
      key: 'id_tipo_producto',
    },
  },
  id_estado_producto: {
    type: DataTypes.INTEGER,
    references: {
      model: EstadoProducto,
      key: 'id_estado_producto',
    },
  },
}, {
  tableName: 'Producto',
  timestamps: false,
});

export default Producto;

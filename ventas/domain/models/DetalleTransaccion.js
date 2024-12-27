import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';
import Producto from '../../../inventario/domain/models/Producto.js';
import Transaccion from './Transaccion.js';
import EstadoDetalleTransaccion from './EstadoDetalleTransaccion.js';
import AgendaCarga from '../../../Entregas/domain/models/AgendaCarga.js';

const DetalleTransaccion = sequelize.define('DetalleTransaccion', {
  id_detalle_transaccion: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_transaccion: {
    type: DataTypes.INTEGER,
    references: {
      model: Transaccion,
      key: 'id_transaccion',
    },
    allowNull: false,
  },
  id_producto: {
    type: DataTypes.INTEGER,
    references: {
      model: Producto,
      key: 'id_producto',
    },
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio_unitario: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  descuento: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  estado_producto_transaccion: {
    type: DataTypes.INTEGER,
    references: {
      model: EstadoDetalleTransaccion,
      key: 'id_estado_detalle_transaccion',
    },
    allowNull: false,
  },
  id_agenda_carga: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permite NULL para los detalles no asignados a una agenda
    references: {
      model: AgendaCarga,
      key: "id_agenda_carga"
    }
  },
}, {
  tableName: 'DetalleTransaccion',
  timestamps: false,
});

export default DetalleTransaccion;

import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';

const TransicionEstadoTransaccion = sequelize.define('TransicionEstadoTransaccion', {
    id_transicion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estado_origen: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoTransaccion,
        key: 'id_estado_transaccion',
      },
    },
    estado_destino: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoTransaccion,
        key: 'id_estado_transaccion',
      },
    },
    condicion: {
      type: DataTypes.STRING, // Condición de negocio
      allowNull: true,
    },
  }, {
    tableName: 'TransicionEstadoTransaccion',
    timestamps: false,
  });

export default TransicionEstadoTransaccion;
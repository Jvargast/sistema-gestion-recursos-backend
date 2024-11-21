import { DataTypes } from 'sequelize';
import sequelize from '../../../database/database.js';
import Cliente from './Cliente.js';
import EstadoTransaccion from './EstadoTransaccion.js';
import Usuarios from '../../../auth/domain/models/Usuarios.js';

const Transaccion = sequelize.define('Transaccion', {
    id_transaccion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo_transaccion: {
      type: DataTypes.STRING, // "cotizacion", "pedido", "venta", "factura"
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    observaciones: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numero_factura: {
      type: DataTypes.STRING,
      allowNull: true, // Solo aplica si tipo_transaccion = "factura"
    },
    tipo_comprobante: {
      type: DataTypes.STRING, // "factura", "boleta"
      allowNull: true,
    },
    estado_pago: {
      type: DataTypes.STRING, // "pendiente", "pagado", "anulado"
      defaultValue: 'pendiente',
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    id_cliente: {
      type: DataTypes.STRING,
      references: {
        model: Cliente,
        key: 'rut',
      },
    },
    id_usuario: {
      type: DataTypes.STRING,
      references: {
        model: Usuarios,
        key: 'rut',
      },
    },
    id_estado_transaccion: {
        type: DataTypes.INTEGER,
        references: {
          model: EstadoTransaccion,
          key: 'id_estado_transaccion',
        },
        allowNull: false,
      }
  }, {
    tableName: 'Transaccion',
    timestamps: false,
  });
  
  export default Transaccion;

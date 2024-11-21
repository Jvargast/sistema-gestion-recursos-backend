import Cliente from './models/Cliente.js';
import Transaccion from './models/Transaccion.js';
import DetalleTransaccion from './models/DetalleTransaccion.js';
import LogTransaccion from './models/LogTransaccion.js';
import Pago from './models/Pago.js';
import EstadoTransaccion from './models/EstadoTransaccion.js';
import Producto from '../../inventario/domain/models/Producto.js';
import Usuarios from '../../auth/domain/models/Usuarios.js';
import EstadoPago from './models/EstadoPago.js';
import MetodoPago from './models/MetodoPago.js';

function loadSalesAssociations() {
// Relación: Cliente -> Transacción
Transaccion.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
Cliente.hasMany(Transaccion, { foreignKey: 'id_cliente', as: 'transacciones' });

// Relación: Estado de transacción -> Transacción
Transaccion.belongsTo(EstadoTransaccion, { foreignKey: 'id_estado_transaccion', as: 'estado' });
EstadoTransaccion.hasMany(Transaccion, { foreignKey: 'id_estado_transaccion', as: 'transacciones' });

// Relación: Usuario -> Transacción
Transaccion.belongsTo(Usuarios, { foreignKey: 'id_usuario', as: 'usuario' });
Usuarios.hasMany(Transaccion, { foreignKey: 'id_usuario', as: 'transacciones' });

// Relación: Transacción -> Detalle de transacción
DetalleTransaccion.belongsTo(Transaccion, { foreignKey: 'id_transaccion', as: 'transaccion' });
Transaccion.hasMany(DetalleTransaccion, { foreignKey: 'id_transaccion', as: 'detalles' });

// Relación: Producto -> Detalle de transacción
DetalleTransaccion.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Producto.hasMany(DetalleTransaccion, { foreignKey: 'id_producto', as: 'detalles' });

// Relación: Transacción -> Pago
Pago.belongsTo(Transaccion, { foreignKey: 'id_transaccion', as: 'transaccion' });
Transaccion.hasMany(Pago, { foreignKey: 'id_transaccion', as: 'pagos' });

// Relación: Pago -> Estado de pago
Pago.belongsTo(EstadoPago, { foreignKey: 'id_estado_pago', as: 'estado' });
EstadoPago.hasMany(Pago, { foreignKey: 'id_estado_pago', as: 'pagos' });

// Relación: Pago -> Método de pago
Pago.belongsTo(MetodoPago, { foreignKey: 'id_metodo_pago', as: 'metodo' });
MetodoPago.hasMany(Pago, { foreignKey: 'id_metodo_pago', as: 'pagos' });

// Relación: Transacción -> Log de transacción
LogTransaccion.belongsTo(Transaccion, { foreignKey: 'id_transaccion', as: 'transaccion' });
Transaccion.hasMany(LogTransaccion, { foreignKey: 'id_transaccion', as: 'logs' });

// Relación: Usuario -> Log de transacción
LogTransaccion.belongsTo(Usuarios, { foreignKey: 'id_usuario', as: 'usuario' });
Usuarios.hasMany(LogTransaccion, { foreignKey: 'id_usuario', as: 'logs' });

console.log('Asociaciones del módulo de ventas cargadas correctamente.');
}

export default loadSalesAssociations;

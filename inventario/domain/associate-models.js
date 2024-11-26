import Producto from './models/Producto.js';
import EstadoProducto from './models/EstadoProducto.js';
import CategoriaProducto from './models/CategoriaProducto.js';
import TipoProducto from './models/TipoProducto.js';
import Inventario from './models/Inventario.js';
import TransicionEstadoProducto from './models/TransicionEstadoProducto.js';

function loadInventarioAssociations() {
  // Relación Producto - EstadoProducto
  Producto.belongsTo(EstadoProducto, { foreignKey: 'id_estado_producto', as: 'estado' });
  EstadoProducto.hasMany(Producto, { foreignKey: 'id_estado_producto', as: 'productos' });

  // Relación Producto - CategoriaProducto
  Producto.belongsTo(CategoriaProducto, { foreignKey: 'id_categoria', as: 'categoria' });
  CategoriaProducto.hasMany(Producto, { foreignKey: 'id_categoria', as: 'productos' });

  // Relación Producto - TipoProducto
  Producto.belongsTo(TipoProducto, { foreignKey: 'id_tipo_producto', as: 'tipo' });
  TipoProducto.hasMany(Producto, { foreignKey: 'id_tipo_producto', as: 'productos' });

  // Relación Producto - Inventario (Uno a Uno)
  Producto.hasOne(Inventario, { foreignKey: 'id_producto', as: 'inventario', onDelete: 'CASCADE' });
  Inventario.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

  // Relación TransicionEstadoProducto - Producto
  Producto.hasMany(TransicionEstadoProducto, { foreignKey: 'id_producto', as: 'transiciones' });
  TransicionEstadoProducto.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

  // Relación TransicionEstadoProducto - EstadoProducto (Origen)
  EstadoProducto.hasMany(TransicionEstadoProducto, { foreignKey: 'id_estado_origen', as: 'transicionesOrigen' });
  TransicionEstadoProducto.belongsTo(EstadoProducto, { foreignKey: 'id_estado_origen', as: 'estadoOrigen' });

  // Relación TransicionEstadoProducto - EstadoProducto (Destino)
  EstadoProducto.hasMany(TransicionEstadoProducto, { foreignKey: 'id_estado_destino', as: 'transicionesDestino' });
  TransicionEstadoProducto.belongsTo(EstadoProducto, { foreignKey: 'id_estado_destino', as: 'estadoDestino' });

}



export default loadInventarioAssociations;

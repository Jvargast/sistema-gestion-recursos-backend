import Usuarios from "../../auth/domain/models/Usuarios.js";
import Producto from "../../inventario/domain/models/Producto.js";
import DetalleTransaccion from "../../ventas/domain/models/DetalleTransaccion.js";
import AgendaCarga from "./models/AgendaCarga.js";
import Camion from "./models/Camion.js";
import Entrega from "./models/Entrega.js";
import InventarioCamion from "./models/InventarioCamion.js";

function loadEntregasAssociations(models) {
    // Relación AgendaCarga con Usuario (Chofer)
    AgendaCarga.belongsTo(Usuarios, {
      foreignKey: 'id_usuario_chofer',
      as: 'usuario',
    });
  
    Usuarios.hasMany(AgendaCarga, {
      foreignKey: 'id_usuario_chofer',
      as: 'agendas',
    });
  
    // Relación AgendaCarga con DetalleTransaccion
    AgendaCarga.hasMany(DetalleTransaccion, {
      foreignKey: 'id_agenda_carga',
      as: 'detalles',
    });
  
    DetalleTransaccion.belongsTo(AgendaCarga, {
      foreignKey: 'id_agenda_carga',
      as: 'agenda',
    });
  
    // Relación Entrega con Usuario (Chofer)
    Entrega.belongsTo(Usuarios, {
      foreignKey: 'id_usuario_chofer',
      as: 'usuario',
    });
  
    Usuarios.hasMany(Entrega, {
      foreignKey: 'id_usuario_chofer',
      as: 'entregas',
    });
  
    // Relación Entrega con DetalleTransaccion
    Entrega.belongsTo(DetalleTransaccion, {
      foreignKey: 'id_detalle_transaccion',
      as: 'detalleTransaccion',
    });
  
    DetalleTransaccion.hasMany(Entrega, {
      foreignKey: 'id_detalle_transaccion',
      as: 'entregas',
    });

    Camion.hasMany(InventarioCamion, {
        foreignKey: 'id_camion',
        as: 'inventario',
    });

    InventarioCamion.belongsTo(Camion, {
        foreignKey: 'id_camion',
        as: 'camion'
    });

    InventarioCamion.belongsTo(Producto,{
        foreignKey: 'id_producto',
        as: 'producto'
    })
  }
  
  export default loadEntregasAssociations;
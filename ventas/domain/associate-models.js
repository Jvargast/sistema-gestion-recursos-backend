import Cliente from "./models/Cliente.js";
import Usuarios from "../../auth/domain/models/Usuarios.js";

import Transaccion from "./models/Transaccion.js";
import DetalleTransaccion from "./models/DetalleTransaccion.js";
import LogTransaccion from "./models/LogTransaccion.js";
import Pago from "./models/Pago.js";
import EstadoTransaccion from "./models/EstadoTransaccion.js";
import Producto from "../../inventario/domain/models/Producto.js";
import EstadoPago from "./models/EstadoPago.js";
import MetodoPago from "./models/MetodoPago.js";
import EstadoDetalleTransaccion from "./models/EstadoDetalleTransaccion.js";
import TransicionEstadoTransaccion from "./models/TransicionEstadoTransaccion.js";
import TransicionEstadoDetalle from "./models/TransicionEstadoDetalle.js";
import Factura from "./models/Factura.js";
import TransicionTipoTransaccion from "./models/TransicionTipoTransaccion.js";
import EstadoFactura from "./models/EstadoFactura.js";
import Documento from "./models/Documento.js";

function loadSalesAssociations() {
  // Relación: Cliente -> Transacción
  Transaccion.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
  Cliente.hasMany(Transaccion, {
    foreignKey: "id_cliente",
    as: "transacciones",
  });

  // Relación: Usuario -> Transacción
  Transaccion.belongsTo(Usuarios, { foreignKey: "id_usuario", as: "usuario" });
  Usuarios.hasMany(Transaccion, {
    foreignKey: "id_usuario",
    as: "transacciones",
  });

  // Relación: Estado de transacción -> Transacción
  Transaccion.belongsTo(EstadoTransaccion, {
    foreignKey: "id_estado_transaccion",
    as: "estado",
  });
  EstadoTransaccion.hasMany(Transaccion, {
    foreignKey: "id_estado_transaccion",
    as: "transacciones",
  });

  // Relación: Factura -> Estado Factura
  Factura.belongsTo(EstadoFactura, {
    foreignKey: "id_estado_factura",
    as: "estado",
  });
  EstadoFactura.hasMany(Factura, {
    foreignKey: "id_estado_factura",
    as: "facturas",
  });

  // Relación: Pago -> Estado de pago
  Pago.belongsTo(EstadoPago, { foreignKey: "id_estado_pago", as: "estado" });
  EstadoPago.hasMany(Pago, { foreignKey: "id_estado_pago", as: "pagos" });

  // Relación: Pago -> Método de pago
  Pago.belongsTo(MetodoPago, { foreignKey: "id_metodo_pago", as: "metodo" });
  MetodoPago.hasMany(Pago, { foreignKey: "id_metodo_pago", as: "pagos" });

  // Relación: Producto -> Detalle de transacción
  DetalleTransaccion.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });
  Producto.hasMany(DetalleTransaccion, {
    foreignKey: "id_producto",
    as: "detalles",
  });

  // Relación: Transacción -> Detalle de transacción
  DetalleTransaccion.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccion",
  });
  Transaccion.hasMany(DetalleTransaccion, {
    foreignKey: "id_transaccion",
    as: "detalles",
  });

  // Relación: Transacción pertenece a Factura
  /*   Transaccion.belongsTo(Factura, {
    foreignKey: "id_factura",
    as: "facturaTransaccion",
  }); */
  /*   Factura.hasOne(Transaccion, {
    foreignKey: "id_factura",
    as: "transaccionFactura",
  }); */
  // Relación con el modelo Transaccion
  Factura.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccion",
  });
  //
  // Relación: Transaccion → Factura
  Transaccion.hasOne(Factura, {
    foreignKey: "id_transaccion", // Campo en la tabla Factura
    as: "factura",
  });

  // Relación: Pago -> Transacción
  Pago.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccionPago",
  });
  Transaccion.hasMany(Pago, {
    foreignKey: "id_transaccion",
    as: "pagosTransaccion",
  });

  // Relación: Log de Transacción -> Transacción
  LogTransaccion.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccionLog",
  });
  Transaccion.hasMany(LogTransaccion, {
    foreignKey: "id_transaccion",
    as: "logsTransaccion",
  });

  // Relación: Usuario -> Log de transacción
  LogTransaccion.belongsTo(Usuarios, {
    foreignKey: "id_usuario",
    as: "usuario",
  });
  Usuarios.hasMany(LogTransaccion, { foreignKey: "id_usuario", as: "logs" });

  /*   // Relación: Transición Tipo Transacción -> Transacción
  TransicionTipoTransaccion.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccionTransicionTipo",
  });
  Transaccion.hasMany(TransicionTipoTransaccion, {
    foreignKey: "id_transaccion",
    as: "transicionesTipoTransaccion",
  }); */
  /* 
  // Relación: Transición Estado Transacción -> Transacción
  TransicionEstadoTransaccion.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
    as: "transaccionTransiciones",
  }); */
  /*   Transaccion.hasMany(TransicionEstadoTransaccion, {
    foreignKey: "id_transaccion",
    as: "transicionesTransaccion",
  }); */

  // Relación: Transición Estado Transacción -> EstadoTransaccion (Origen)
  TransicionEstadoTransaccion.belongsTo(EstadoTransaccion, {
    foreignKey: "id_estado_origen",
    as: "estadoOrigen",
  });
  EstadoTransaccion.hasMany(TransicionEstadoTransaccion, {
    foreignKey: "id_estado_origen",
    as: "transicionesOrigen",
  });

  // Relación: Transición Estado Transacción -> EstadoTransaccion (Destino)
  TransicionEstadoTransaccion.belongsTo(EstadoTransaccion, {
    foreignKey: "id_estado_destino",
    as: "estadoDestino",
  });
  EstadoTransaccion.hasMany(TransicionEstadoTransaccion, {
    foreignKey: "id_estado_destino",
    as: "transicionesDestino",
  });

  /*   // Relación: Transición Estado Detalle -> DetalleTransacción
  TransicionEstadoDetalle.belongsTo(DetalleTransaccion, {
    foreignKey: "id_detalle_transaccion",
    as: "detalleTransaccion",
  });
  DetalleTransaccion.hasMany(TransicionEstadoDetalle, {
    foreignKey: "id_detalle_transaccion",
    as: "transicionesDetalle",
  }); */

  // Relación: Detalle Transacción -> Estado Detalle Transacción
  DetalleTransaccion.belongsTo(EstadoDetalleTransaccion, {
    foreignKey: "estado_producto_transaccion",
    as: "estado",
  });
  EstadoDetalleTransaccion.hasMany(DetalleTransaccion, {
    foreignKey: "estado_producto_transaccion", //estado_producto_transaccion o id_estado_detalle_transaccion
    as: "detalles_transacciones",
  });

  // Relación: Transición Estado Detalle -> Estado Detalle Transacción (Origen)
  TransicionEstadoDetalle.belongsTo(EstadoDetalleTransaccion, {
    foreignKey: "id_estado_origen",
    as: "estadoOrigen",
  });
  EstadoDetalleTransaccion.hasMany(TransicionEstadoDetalle, {
    foreignKey: "id_estado_origen",
    as: "transicionesOrigen",
  });

  // Relación: Transición Estado Detalle -> Estado Detalle Transacción (Destino)
  TransicionEstadoDetalle.belongsTo(EstadoDetalleTransaccion, {
    foreignKey: "id_estado_destino",
    as: "estadoDestino",
  });
  EstadoDetalleTransaccion.hasMany(TransicionEstadoDetalle, {
    foreignKey: "id_estado_destino",
    as: "transicionesDestino",
  });

  //Implementación futura
  Transaccion.hasMany(Documento, {
    foreignKey: "id_transaccion",
    as: "documentos",
  });
  Documento.belongsTo(Transaccion, {
    foreignKey: "id_transaccion",
  });

  console.log("Asociaciones del módulo de ventas cargadas correctamente.");
}

export default loadSalesAssociations;

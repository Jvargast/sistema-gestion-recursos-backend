const ventasDependencias = [
    // caja
    { permiso: "ventas.caja.crear", dependeDe: "ventas.caja.ver" },
    { permiso: "ventas.caja.editar", dependeDe: "ventas.caja.ver" },
    { permiso: "ventas.caja.eliminar", dependeDe: "ventas.caja.ver" },
  
    // cliente
    { permiso: "ventas.cliente.crear", dependeDe: "ventas.cliente.ver" },
    { permiso: "ventas.cliente.editar", dependeDe: "ventas.cliente.ver" },
    { permiso: "ventas.cliente.eliminar", dependeDe: "ventas.cliente.ver" },
  
    // cotizacion
    { permiso: "ventas.cotizacion.crear", dependeDe: "ventas.cotizacion.ver" },
    { permiso: "ventas.cotizacion.editar", dependeDe: "ventas.cotizacion.ver" },
    { permiso: "ventas.cotizacion.eliminar", dependeDe: "ventas.cotizacion.ver" },
      
    // documento
    { permiso: "ventas.documento.crear", dependeDe: "ventas.documento.ver" },
    { permiso: "ventas.documento.editar", dependeDe: "ventas.documento.ver" },
    { permiso: "ventas.documento.eliminar", dependeDe: "ventas.documento.ver" },
  
    // estadopago
    { permiso: "ventas.estadopago.crear", dependeDe: "ventas.estadopago.ver" },
    { permiso: "ventas.estadopago.editar", dependeDe: "ventas.estadopago.ver" },
    { permiso: "ventas.estadopago.eliminar", dependeDe: "ventas.estadopago.ver" },
  
    // estadoventa
    { permiso: "ventas.estadoventa.crear", dependeDe: "ventas.estadoventa.ver" },
    { permiso: "ventas.estadoventa.editar", dependeDe: "ventas.estadoventa.ver" },
    { permiso: "ventas.estadoventa.eliminar", dependeDe: "ventas.estadoventa.ver" },
  
    // historialcaja
    { permiso: "ventas.historialcaja.crear", dependeDe: "ventas.historialcaja.ver" },
    { permiso: "ventas.historialcaja.editar", dependeDe: "ventas.historialcaja.ver" },
    { permiso: "ventas.historialcaja.eliminar", dependeDe: "ventas.historialcaja.ver" },
  
    // logcotizacion
    { permiso: "ventas.logcotizacion.crear", dependeDe: "ventas.logcotizacion.ver" },
    { permiso: "ventas.logcotizacion.editar", dependeDe: "ventas.logcotizacion.ver" },
    { permiso: "ventas.logcotizacion.eliminar", dependeDe: "ventas.logcotizacion.ver" },
  
    // logventa
    { permiso: "ventas.logventa.crear", dependeDe: "ventas.logventa.ver" },
    { permiso: "ventas.logventa.editar", dependeDe: "ventas.logventa.ver" },
    { permiso: "ventas.logventa.eliminar", dependeDe: "ventas.logventa.ver" },
  
    // metodopago
    { permiso: "ventas.metodopago.crear", dependeDe: "ventas.metodopago.ver" },
    { permiso: "ventas.metodopago.editar", dependeDe: "ventas.metodopago.ver" },
    { permiso: "ventas.metodopago.eliminar", dependeDe: "ventas.metodopago.ver" },
  
    // movimientocaja
    { permiso: "ventas.movimientocaja.crear", dependeDe: "ventas.movimientocaja.ver" },
    { permiso: "ventas.movimientocaja.editar", dependeDe: "ventas.movimientocaja.ver" },
    { permiso: "ventas.movimientocaja.eliminar", dependeDe: "ventas.movimientocaja.ver" },
  
    // pago
    { permiso: "ventas.pago.crear", dependeDe: "ventas.pago.ver" },
    { permiso: "ventas.pago.editar", dependeDe: "ventas.pago.ver" },
    { permiso: "ventas.pago.eliminar", dependeDe: "ventas.pago.ver" },
  
    // pedido
    { permiso: "ventas.pedido.crear", dependeDe: "ventas.pedido.ver" },
    { permiso: "ventas.pedido.editar", dependeDe: "ventas.pedido.ver" },
    { permiso: "ventas.pedido.eliminar", dependeDe: "ventas.pedido.ver" },
  
    // venta
    { permiso: "ventas.venta.crear", dependeDe: "ventas.venta.ver" },
    { permiso: "ventas.venta.editar", dependeDe: "ventas.venta.ver" },
    { permiso: "ventas.venta.eliminar", dependeDe: "ventas.venta.ver" },

    // factura
    { permiso: "ventas.factura.crear", dependeDe: "ventas.factura.ver" },
    { permiso: "ventas.factura.editar", dependeDe: "ventas.factura.ver" },
    { permiso: "ventas.factura.eliminar", dependeDe: "ventas.factura.ver" },
  ];
  
  export default ventasDependencias;
  
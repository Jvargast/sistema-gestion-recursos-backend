const permisosVentas = [
  // Caja
  {
    nombre: "ventas.caja.crear",
    descripcion: "Permiso para crear caja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.caja.editar",
    descripcion: "Permiso para editar caja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.caja.ver",
    descripcion: "Permiso para ver caja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.caja.eliminar",
    descripcion: "Permiso para eliminar caja",
    categoria: "ventas",
  },
  // cliente
  {
    nombre: "ventas.cliente.crear",
    descripcion: "Permiso para crear cliente",
    categoria: "ventas",
  },
  {
    nombre: "ventas.cliente.editar",
    descripcion: "Permiso para editar cliente",
    categoria: "ventas",
  },
  {
    nombre: "ventas.cliente.ver",
    descripcion: "Permiso para ver cliente",
    categoria: "ventas",
  },
  {
    nombre: "ventas.cliente.eliminar",
    descripcion: "Permiso para eliminar cliente",
    categoria: "ventas",
  },
  // cotización
  {
    nombre: "ventas.cotizacion.crear",
    descripcion: "Permiso para crear cotizacion",
    categoria: "ventas",
  },
  {
    nombre: "ventas.cotizacion.editar",
    descripcion: "Permiso para editar cotizacion",
    categoria: "ventas",
  },
  {
    nombre: "ventas.cotizacion.ver",
    descripcion: "Permiso para ver cotizacion",
    categoria: "ventas",
  },
  {
    nombre: "ventas.cotizacion.eliminar",
    descripcion: "Permiso para eliminar cotizacion",
    categoria: "ventas",
  },
  // documento
  {
    nombre: "ventas.documento.crear",
    descripcion: "Permiso para crear documento",
    categoria: "ventas",
  },
  {
    nombre: "ventas.documento.editar",
    descripcion: "Permiso para editar documento",
    categoria: "ventas",
  },
  {
    nombre: "ventas.documento.ver",
    descripcion: "Permiso para ver documento",
    categoria: "ventas",
  },
  {
    nombre: "ventas.documento.eliminar",
    descripcion: "Permiso para eliminar documento",
    categoria: "ventas",
  },
  // estadopago
  {
    nombre: "ventas.estadopago.crear",
    descripcion: "Permiso para crear estadopago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.estadopago.editar",
    descripcion: "Permiso para editar estadopago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.estadopago.ver",
    descripcion: "Permiso para ver estadopago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.estadopago.eliminar",
    descripcion: "Permiso para eliminar estadopago",
    categoria: "ventas",
  },
  // estadoventa
  {
    nombre: "ventas.estadoventa.crear",
    descripcion: "Permiso para crear estadoventa",
    categoria: "ventas",
  },
  {
    nombre: "ventas.estadoventa.editar",
    descripcion: "Permiso para editar estadoventa",
    categoria: "ventas",
  },
  {
    nombre: "ventas.estadoventa.ver",
    descripcion: "Permiso para ver estadoventa",
    categoria: "ventas",
  },
  {
    nombre: "ventas.estadoventa.eliminar",
    descripcion: "Permiso para eliminar estadoventa",
    categoria: "ventas",
  },
  // historialcaja
  {
    nombre: "ventas.historialcaja.crear",
    descripcion: "Permiso para crear historialcaja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.historialcaja.editar",
    descripcion: "Permiso para editar historialcaja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.historialcaja.ver",
    descripcion: "Permiso para ver historialcaja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.historialcaja.eliminar",
    descripcion: "Permiso para eliminar historialcaja",
    categoria: "ventas",
  },
  // logcotizacion
  {
    nombre: "ventas.logcotizacion.crear",
    descripcion: "Permiso para crear logcotizacion",
    categoria: "ventas",
  },
  {
    nombre: "ventas.logcotizacion.editar",
    descripcion: "Permiso para editar logcotizacion",
    categoria: "ventas",
  },
  {
    nombre: "ventas.logcotizacion.ver",
    descripcion: "Permiso para ver logcotizacion",
    categoria: "ventas",
  },
  {
    nombre: "ventas.logcotizacion.eliminar",
    descripcion: "Permiso para eliminar logcotizacion",
    categoria: "ventas",
  },
  // logventa
  {
    nombre: "ventas.logventa.crear",
    descripcion: "Permiso para crear logventa",
    categoria: "ventas",
  },
  {
    nombre: "ventas.logventa.editar",
    descripcion: "Permiso para editar logventa",
    categoria: "ventas",
  },
  {
    nombre: "ventas.logventa.ver",
    descripcion: "Permiso para ver logventa",
    categoria: "ventas",
  },
  {
    nombre: "ventas.logventa.eliminar",
    descripcion: "Permiso para eliminar logventa",
    categoria: "ventas",
  },
  // metodopago
  {
    nombre: "ventas.metodopago.crear",
    descripcion: "Permiso para crear metodopago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.metodopago.editar",
    descripcion: "Permiso para editar metodopago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.metodopago.ver",
    descripcion: "Permiso para ver metodopago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.metodopago.eliminar",
    descripcion: "Permiso para eliminar metodopago",
    categoria: "ventas",
  },
  // movimientocaja
  {
    nombre: "ventas.movimientocaja.crear",
    descripcion: "Permiso para crear movimientocaja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.movimientocaja.editar",
    descripcion: "Permiso para editar movimientocaja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.movimientocaja.ver",
    descripcion: "Permiso para ver movimientocaja",
    categoria: "ventas",
  },
  {
    nombre: "ventas.movimientocaja.eliminar",
    descripcion: "Permiso para eliminar movimientocaja",
    categoria: "ventas",
  },
  // pago
  {
    nombre: "ventas.pago.crear",
    descripcion: "Permiso para crear pago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.pago.editar",
    descripcion: "Permiso para editar pago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.pago.ver",
    descripcion: "Permiso para ver pago",
    categoria: "ventas",
  },
  {
    nombre: "ventas.pago.eliminar",
    descripcion: "Permiso para eliminar pago",
    categoria: "ventas",
  },
  // pedido
  {
    nombre: "ventas.pedido.crear",
    descripcion: "Permiso para crear pedido",
    categoria: "ventas",
  },
  {
    nombre: "ventas.pedido.editar",
    descripcion: "Permiso para editar pedido",
    categoria: "ventas",
  },
  {
    nombre: "ventas.pedido.ver",
    descripcion: "Permiso para crear pedido",
    categoria: "ventas",
  },
  {
    nombre: "ventas.pedido.eliminar",
    descripcion: "Permiso para eliminar pedido",
    categoria: "ventas",
  },
  // venta
  {
    nombre: "ventas.venta.crear",
    descripcion: "Permiso para crear venta",
    categoria: "ventas",
  },
  {
    nombre: "ventas.venta.editar",
    descripcion: "Permiso para editar venta",
    categoria: "ventas",
  },
  {
    nombre: "ventas.venta.ver",
    descripcion: "Permiso para ver venta",
    categoria: "ventas",
  },
  {
    nombre: "ventas.venta.eliminar",
    descripcion: "Permiso para eliminar venta",
    categoria: "ventas",
  },
  // factura
  {
    nombre: "ventas.factura.crear",
    descripcion: "Permiso para crear factura",
    categoria: "ventas",
  },
  {
    nombre: "ventas.factura.editar",
    descripcion: "Permiso para editar factura",
    categoria: "ventas",
  },
  {
    nombre: "ventas.factura.ver",
    descripcion: "Permiso para ver factura",
    categoria: "ventas",
  },
  {
    nombre: "ventas.factura.eliminar",
    descripcion: "Permiso para eliminar factura",
    categoria: "ventas",
  },
];

export default permisosVentas;

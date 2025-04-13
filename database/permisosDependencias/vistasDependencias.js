const vistasDependencias = [
  // por revisar dashboard analisis dependencias
  // 1. dashboard
  {
    permiso: "vistas.dashboard.ver",
    dependeDe: ["dashboard.dashboardcentral.ver"],
  },
  // 2. punto-venta
  {
    permiso: "vistas.puntoventa.ver",
    dependeDe: [
      "ventas.venta.ver",
      "inventario.producto.ver",
      "inventario.producto.disponible",
      "inventario.categoriaproducto.ver",
      "auth.usuario.vendedores",
      "ventas.cliente.ver",
      "ventas.venta.crear",
      "ventas.caja.ver",
      "ventas.caja.abrir",
      "ventas.caja.cerrar",
      "ventas.caja.asignada",
      "ventas.caja.estado",
    ],
  },
  // 3. ver ventas y ver venta
  {
    permiso: "vistas.ventas.ver",
    dependeDe: [
      "ventas.venta.ver",
      "ventas.venta.editar",
      "ventas.venta.eliminar",
    ],
  },
  // 4. punto-cotización
  {
    permiso: "vistas.puntocotizacion.ver",
    dependeDe: [
      "ventas.cotizacion.ver",
      "ventas.cotizacion.crear",
      "ventas.cliente.ver",
      "inventario.producto.ver",
      "inventario.categoriaproducto.ver",
    ],
  },
  // 5. ver cotizaciones y ver cotización
  {
    permiso: "vistas.cotizaciones.ver",
    dependeDe: [
      "ventas.cotizacion.ver",
      "ventas.cotizacion.editar",
      "ventas.cotizacion.eliminar",
      "ventas.cotizacion.pdf",
    ],
  },
  // 6. punto-pedido
  {
    permiso: "vistas.puntopedido.ver",
    dependeDe: [
      "ventas.pedido.ver",
      "ventas.pedido.crear",
      "ventas.cliente.ver",
      "inventario.producto.ver",
      "inventario.categoriaproducto.ver",
    ],
  },
  // 7. admin-pedidos
  {
    permiso: "vistas.adminpedidos.ver",
    dependeDe: [
      "ventas.pedido.ver",
      "auth.usuario.choferes",
      "ventas.pedido.asignar",
      "ventas.pedido.desasignar",
    ],
  },
  // 8. mis-pedidos
  {
    permiso: "vistas.mispedidos.ver",
    dependeDe: [
      "ventas.pedido.ver",
      "entregas.agendaviaje.ver",
      "ventas.pedido.confirmar",
      "ventas.pedido.asignados",
      "ventas.pedido.noasignados",
      "ventas.pedido.historial",
      "ventas.pedido.propios",
    ],
  },
  // 9. ver pedidos y ver pedido
  {
    permiso: "vistas.pedidos.ver",
    dependeDe: [
      "ventas.pedido.ver",
      "entregas.agendaviaje.ver",
      "ventas.pedido.pago",
      "ventas.pedido.asignados",
      "ventas.pedido.historial",
      "ventas.pedido.editar",
      "ventas.pedido.eliminar",
    ],
  },
  // 10. ver pagos o ver pago
  {
    permiso: "vistas.pagos.ver",
    dependeDe: [
      "ventas.pago.ver",
      "ventas.pago.editar",
      "ventas.pago.eliminar",
      "ventas.documento.ver",
    ],
  },
  // 11. ver facturas o ver factura
  {
    permiso: "vistas.facturas.ver",
    dependeDe: [
      "ventas.factura.ver",
      "ventas.factura.editar",
      "ventas.factura.eliminar",
      "ventas.documento.ver",
      "ventas.factura.pdf",
      "ventas.factura.registrar",
    ],
  },
  // 12. ver clientes o ver cliente
  {
    permiso: "vistas.clientes.ver",
    dependeDe: [
      "ventas.cliente.ver",
      "ventas.cliente.crear",
      "ventas.cliente.editar",
      "ventas.cliente.eliminar",
    ],
  },
  // 13. ver productos o ver producto
  {
    permiso: "vistas.productos.ver",
    dependeDe: ["inventario.producto.ver", "inventario.categoriaproducto.ver"],
  },
  {
    permiso: "vistas.productos.gestionar",
    dependeDe: [
      "inventario.producto.crear",
      "inventario.producto.editar",
      "inventario.producto.eliminar",
    ],
  },
  // 14. ver insumos o ver insumo
  {
    permiso: "vistas.insumos.ver",
    dependeDe: ["inventario.insumo.ver", "inventario.tipoinsumo.ver"],
  },
  {
    permiso: "vistas.insumos.gestionar",
    dependeDe: [
      "inventario.insumo.crear",
      "inventario.insumo.editar",
      "inventario.insumo.eliminar",
    ],
  },
  // 15. ver categorias o ver categoria
  {
    permiso: "vistas.categorias.ver",
    dependeDe: ["inventario.categoriaproducto.ver"],
  },
  {
    permiso: "vistas.categorias.gestionar",
    dependeDe: [
      "inventario.categoriaproducto.crear",
      "inventario.categoriaproducto.editar",
      "inventario.categoriaproducto.eliminar",
    ],
  },
  // 15. ver categorias o ver categoria
  {
    permiso: "vistas.tipoinsumos.ver",
    dependeDe: ["inventario.tipoinsumo.ver"],
  },
  {
    permiso: "vistas.tipoinsumos.gestionar",
    dependeDe: [
      "inventario.tipoinsumo.crear",
      "inventario.tipoinsumo.editar",
      "inventario.tipoinsumo.eliminar",
    ],
  },
  // 16. ver camiones o ver camion
  {
    permiso: "vistas.camiones.ver",
    dependeDe: [
      "entregas.camion.ver",
     
    ],
  },
  {
    permiso: "vistas.camiones.gestionar",
    dependeDe: [
        "entregas.camion.crear",
        "entregas.camion.editar",
        "entregas.camion.eliminar",
        "entregas.camion.asignar",
        "entregas.camion.desasignar"
    ]
  },
  // 17. ver viajes o ver viaje
  {
    permiso: "vistas.viajes.ver",
    dependeDe: [
      "entregas.agendaviaje.ver",
    ],
  },
  {
    permiso: "vistas.viajes.ver",
    dependeDe: [
      "entregas.agendaviaje.ver",
      "ventas.pedido.ver",
      "entregas.entrega.ver",
      "entregas.inventariocamion.ver",
      "entregas.ventaschofer.ver",
      "entregas.inventariocamion.estado",
      "entregas.inventariocamion.disponible",
      "entregas.agendaviaje.finalizar",
      "entregas.entrega.misentregas",
      "entregas.agendaviaje.misviajes",
      "entregas.ventaschofer.ver",
      "entregas.ventaschofer.crear",
      "entregas.agendaviaje.mihistorial",
    ],
  },
  // 18. ver historialviajes o ver historialviaje
  {
    permiso: "vistas.historialViajes.ver",
    dependeDe: ["entregas.agendaviaje.ver"],
  },
  // 19. ver agendacargas o ver agendacarga
  {
    permiso: "vistas.agendaCarga.crear",
    dependeDe: [
      "entregas.agendacarga.ver",
      "entregas.agendacarga.editar",
      "entregas.agendacarga.eliminar",
      "entregas.agendacarga.confirmar",
      "auth.usuario.choferes",
      "entregas.camion.ver",
      "inventario.producto.disponible",
      "entregas.inventariocamion.estado",
      "ventas.pedido.confirmados",
    ],
  },
  // 20. ver usuarios o ver usuario
  {
    permiso: "vistas.usuarios.ver",
    dependeDe: [
      "auth.usuarios.ver",
      "auth.usuarios.crear",
      "auth.usuarios.editar",
      "auth.usuarios.eliminar",
      "auth.roles.ver",
      "auth.empresa.ver",
      "auth.sucursal.ver",
    ],
  },
  // 21. ver roles o ver rol
  {
    permiso: "vistas.roles.ver",
    dependeDe: [
      "auth.roles.ver",
      "auth.roles.crear",
      "auth.roles.editar",
      "auth.roles.eliminar",
    ],
  },
  // 22. ver empresas o ver empresa
  {
    permiso: "vistas.empresas.ver",
    dependeDe: ["auth.empresa.ver", "auth.sucursal.ver"],
  },
  // 23. ver perfil
  {
    permiso: "vistas.perfil.ver",
    dependeDe: ["auth.iniciarsesion", "auth.perfil.actualizar"],
  },
  // 24. ver panel
  {
    permiso: "vistas.admin.ver",
    dependeDe: [
      "auth.roles.ver",
      "auth.usuarios.ver",
      "dashboard.dashboardcentral.ver",
    ],
  },
  // 25. ver seguridad
  {
    permiso: "vistas.seguridad.ver",
    dependeDe: ["auth.securitysettings.ver"],
  },
  // 26. ver analisis
  {
    permiso: "vistas.analisis.ver",
    dependeDe: ["vistas.dashboard.ver"],
  },
  // 27. ver cajas o ver caja
  {
    permiso: "vistas.cajas.ver",
    dependeDe: [
      "ventas.caja.ver",
      "ventas.caja.crear",
      "ventas.caja.asignar",
      "ventas.caja.editar",
      "auth.sucursal.ver",
      "auth.usuario.vendedores",
      "ventas.movimiento.ver",
    ],
  },
];

export default vistasDependencias;

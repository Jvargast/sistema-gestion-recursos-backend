const choferPermisos = [
    // Autenticación básica
    "auth.iniciarsesion",
    "auth.perfil.actualizar",
    "auth.perfil.ver",
    "auth.usuario.choferes",
  
    // Vistas necesarias
    "vistas.viajes.ver",
    "vistas.mispedidos.ver",
    "vistas.pedidos.ver",
    "vistas.clientes.ver",
    "vistas.perfil.ver",
    "vistas.camiones.ver",
    "vistas.entregas.ver",
    "vistas.agendaCarga.crear",
  
    // Ventas (ventas rápidas)
    "ventas.venta.crear",
    "ventas.documento.crear",
    "ventas.pago.crear",
    "ventas.movimientocaja.crear",
    "ventas.movimiento.ver",

    // Pedidos
    "ventas.pedido.ver",
    "ventas.pedido.confirmar",
    "ventas.pedido.noasignados",
    "ventas.pedido.asignados",
    "ventas.pedido.propios",
    "ventas.pedido.historial",
  
    // Entregas y viajes
    "entregas.entrega.misentregas",
    "entregas.entrega.crear",
    "entregas.entrega.ver",
    "entregas.agendaviaje.ver",
    "entregas.agendaviaje.misviajes",
    "entregas.agendaviaje.mihistorial",
    "entregas.agendaviaje.finalizar",
    "entregas.inventariocamion.ver",
    "entregas.inventariocamion.estado",
    "entregas.inventariocamion.disponible",
    "entregas.ventaschofer.ver",
    "entregas.camion.ver",
    "entregas.agendacarga.confirmar",
    "entregas.agendacarga.ver",
    "entregas.agendacarga.crear",
  
    // Clientes
    "ventas.cliente.ver",
    "ventas.cliente.crear",
  
    // Inventario camión
    "inventario.producto.ver",
    "inventario.producto.disponible",
    "inventario.estadoproducto.ver",
    "inventario.categoriaproducto.ver",


  ];
  
  export default choferPermisos;
  
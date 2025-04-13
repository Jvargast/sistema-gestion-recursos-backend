const funcionesPermisos = [
    // Punto de venta
    { nombre: "inventario.producto.disponible", descripcion: "Consultar productos disponibles para venta", categoria: "Inventario" },
    { nombre: "ventas.caja.abrir", descripcion: "Abrir caja para ventas", categoria: "Ventas" },
    { nombre: "ventas.caja.cerrar", descripcion: "Cerrar caja", categoria: "Ventas" },
    { nombre: "ventas.caja.asignada", descripcion: "Ver caja asignada al usuario", categoria: "Ventas" },
    { nombre: "ventas.caja.estado", descripcion: "Ver estado de caja", categoria: "Ventas" },
  
    // Admin pedidos
    { nombre: "ventas.pedido.asignar", descripcion: "Asignar pedidos a choferes", categoria: "Ventas" },
    { nombre: "ventas.pedido.desasignar", descripcion: "Desasignar pedidos", categoria: "Ventas" },
  
    // Mis pedidos y pedidos
    { nombre: "ventas.pedido.confirmar", descripcion: "Confirmar pedido para entrega", categoria: "Ventas" },
    { nombre: "ventas.pedido.asignados", descripcion: "Ver pedidos asignados", categoria: "Ventas" },
    { nombre: "ventas.pedido.noasignados", descripcion: "Ver pedidos no-asignados", categoria: "Ventas" },
    { nombre: "ventas.pedido.historial", descripcion: "Consultar historial de pedidos", categoria: "Ventas" },
    { nombre: "ventas.pedido.pago", descripcion: "Registrar pago del pedido", categoria: "Ventas" },
    { nombre: "ventas.pedido.confirmados", descripcion: "Ver pedidos confirmados para carga", categoria: "Ventas" },
    { nombre: "ventas.pedido.propios", descripcion: "Ver mis pedidos para carga", categoria: "Ventas" },


    // Cotización
    { nombre: "ventas.cotizacion.pdf", descripcion: "Generar documento PDF cotización", categoria: "Ventas" },
  
    // Facturas
    { nombre: "ventas.factura.registrar", descripcion: "Registrar factura en el sistema", categoria: "Ventas" },
    { nombre: "ventas.factura.pdf", descripcion: "Generar documento PDF factura", categoria: "Ventas" },

    // Clientes
    { nombre:  "ventas.cliente.buscar", descripcion: "Buscar cliente", categoria: "Ventas" },
    { nombre:  "ventas.cliente.desactivar", descripcion: "Desactivar cliente", categoria: "Ventas" },
    { nombre:  "ventas.cliente.reactivar", descripcion: "Reactivar cliente", categoria: "Ventas" },
    { nombre:  "ventas.cliente.porcentaje", descripcion: "Porcentaje clientes", categoria: "Ventas" },

  
    // Entregas y viajes
    { nombre: "entregas.inventariocamion.estado", descripcion: "Ver estado del inventario del camión", categoria: "Entregas" },
    { nombre: "entregas.inventariocamion.disponible", descripcion: "Ver inventario del camión disponible", categoria: "Entregas" },
    { nombre: "entregas.agendaviaje.finalizar", descripcion: "Finalizar una agenda de viaje", categoria: "Entregas" },
    { nombre: "entregas.entrega.misentregas", descripcion: "Ver entregas asignadas al chofer", categoria: "Entregas" },
    { nombre: "entregas.agendaviaje.misviajes", descripcion: "Ver viajes asignados al chofer", categoria: "Entregas" },
    { nombre: "entregas.agendaviaje.mihistorial", descripcion: "Ver historial personal de viajes", categoria: "Entregas" },
    { nombre: "entregas.ventaschofer.crear", descripcion: "Registrar venta directa del chofer", categoria: "Entregas" },
    { nombre: "entregas.camion.asignar", descripcion: "Asignar chofer al camión", categoria: "Entregas" },
    { nombre: "entregas.camion.desasignar", descripcion: "Desasignar chofer al camión", categoria: "Entregas" },
  
    // Agenda carga
    { nombre: "entregas.agendacarga.confirmar", descripcion: "Confirmar la agenda de carga", categoria: "Entregas" },
  
    // Usuario por rol
    { nombre: "auth.usuario.choferes", descripcion: "Consultar usuarios con rol chofer", categoria: "Usuarios" },
    { nombre: "auth.usuario.vendedores", descripcion: "Consultar usuarios con rol vendedor", categoria: "Usuarios" },
    { nombre: "auth.perfil.actualizar", descripcion: "Actualizar perfil", categoria: "Usuarios" },
    { nombre: "auth.perfil.ver", descripcion: "Ver mi perfil", categoria: "Usuarios" },


    // Cajas
    { nombre: "ventas.movimiento.ver", descripcion: "Consultar movimientos de caja", categoria: "Ventas" },
    { nombre: "ventas.caja.asignar", descripcion: "Asignar usuario a caja", categoria: "Ventas" },

    // Dashboard
    { nombre: "dashboard.dashboardcentral.ver", descripcion: "Ver dashboard principal", categoria: "Dashboard", }
  ];
  
  export default funcionesPermisos;
  
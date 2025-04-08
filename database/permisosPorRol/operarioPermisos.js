const operarioPermisos = [
    // Autenticación básica
    "auth.iniciarsesion",
    "auth.perfil.actualizar",
    "auth.perfil.ver",

  
    // Inventario: productos
    "inventario.producto.ver",
    "inventario.producto.crear",
    "inventario.producto.editar",
    "inventario.producto.eliminar",
    "inventario.producto.disponible",
    "inventario.estadoproducto.ver",
    "inventario.productoretornable.ver",
  
    // Inventario: insumos
    "inventario.insumo.ver",
    "inventario.insumo.crear",
    "inventario.insumo.editar",
    "inventario.insumo.eliminar",
    "inventario.tipoinsumo.ver",
  
    // Inventario: general
    "inventario.inventario.ver",
    "inventario.inventario.crear",
    "inventario.inventario.editar",
    "inventario.inventario.eliminar",
    "inventario.inventariologs.ver",
    "inventario.categoriaproducto.ver",
    "inventario.estadoproductoretornable.ver",
  
    // Vistas
    "vistas.productos.ver",
    "vistas.productos.gestionar",
    "vistas.insumos.ver",
    "vistas.insumos.gestionar",
    "vistas.categorias.ver",
    "vistas.tipoinsumos.ver",
    "vistas.perfil.ver",
  ];
  
  export default operarioPermisos;
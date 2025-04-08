const inventarioDependencias = [
    // categoriaproducto
    { permiso: "inventario.categoriaproducto.crear", dependeDe: "inventario.categoriaproducto.ver" },
    { permiso: "inventario.categoriaproducto.editar", dependeDe: "inventario.categoriaproducto.ver" },
    { permiso: "inventario.categoriaproducto.eliminar", dependeDe: "inventario.categoriaproducto.ver" },
  
    // estadoproducto
    { permiso: "inventario.estadoproducto.crear", dependeDe: "inventario.estadoproducto.ver" },
    { permiso: "inventario.estadoproducto.editar", dependeDe: "inventario.estadoproducto.ver" },
    { permiso: "inventario.estadoproducto.eliminar", dependeDe: "inventario.estadoproducto.ver" },
  
    // estadoproductoretornable
    { permiso: "inventario.estadoproductoretornable.crear", dependeDe: "inventario.estadoproductoretornable.ver" },
    { permiso: "inventario.estadoproductoretornable.editar", dependeDe: "inventario.estadoproductoretornable.ver" },
    { permiso: "inventario.estadoproductoretornable.eliminar", dependeDe: "inventario.estadoproductoretornable.ver" },
  
    // insumo
    { permiso: "inventario.insumo.crear", dependeDe: "inventario.insumo.ver" },
    { permiso: "inventario.insumo.editar", dependeDe: "inventario.insumo.ver" },
    { permiso: "inventario.insumo.eliminar", dependeDe: "inventario.insumo.ver" },
  
    // inventario
    { permiso: "inventario.inventario.crear", dependeDe: "inventario.inventario.ver" },
    { permiso: "inventario.inventario.editar", dependeDe: "inventario.inventario.ver" },
    { permiso: "inventario.inventario.eliminar", dependeDe: "inventario.inventario.ver" },
  
    // inventariologs
    { permiso: "inventario.inventariologs.crear", dependeDe: "inventario.inventariologs.ver" },
    { permiso: "inventario.inventariologs.editar", dependeDe: "inventario.inventariologs.ver" },
    { permiso: "inventario.inventariologs.eliminar", dependeDe: "inventario.inventariologs.ver" },
  
    // producto
    { permiso: "inventario.producto.crear", dependeDe: "inventario.producto.ver" },
    { permiso: "inventario.producto.editar", dependeDe: "inventario.producto.ver" },
    { permiso: "inventario.producto.eliminar", dependeDe: "inventario.producto.ver" },
  
    // productoretornable
    { permiso: "inventario.productoretornable.crear", dependeDe: "inventario.productoretornable.ver" },
    { permiso: "inventario.productoretornable.editar", dependeDe: "inventario.productoretornable.ver" },
    { permiso: "inventario.productoretornable.eliminar", dependeDe: "inventario.productoretornable.ver" },
  
    // tipoinsumo
    { permiso: "inventario.tipoinsumo.crear", dependeDe: "inventario.tipoinsumo.ver" },
    { permiso: "inventario.tipoinsumo.editar", dependeDe: "inventario.tipoinsumo.ver" },
    { permiso: "inventario.tipoinsumo.eliminar", dependeDe: "inventario.tipoinsumo.ver" },
  ];
  
  export default inventarioDependencias;
  
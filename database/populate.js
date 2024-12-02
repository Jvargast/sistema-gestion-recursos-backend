import sequelize from "./database.js";
/**
 * Módulo Usuarios 4
 */
import Usuarios from "../auth/domain/models/Usuarios.js";
import Roles from "../auth/domain/models/Roles.js";
import Permisos from "../auth/domain/models/Permisos.js";
import RolesPermisos from "../auth/domain/models/RolesPermisos.js";
/**
 * Módulo Inventario 7
 */
import EstadoProducto from "../inventario/domain/models/EstadoProducto.js";
import Producto from "../inventario/domain/models/Producto.js";
import TipoProducto from "../inventario/domain/models/TipoProducto.js";
import Inventario from "../inventario/domain/models/Inventario.js";
import CategoriaProducto from "../inventario/domain/models/CategoriaProducto.js";
import InventarioLog from "../inventario/domain/models/InventarioLogs.js";
import TransicionEstadoProducto from "../inventario/domain/models/TransicionEstadoProducto.js";
/**
 * Módulo Ventas 14
 */
import EstadoPago from "../ventas/domain/models/EstadoPago.js";
import MetodoPago from "../ventas/domain/models/MetodoPago.js";
import Pago from "../ventas/domain/models/Pago.js";
import DetalleTransaccion from "../ventas/domain/models/DetalleTransaccion.js";
import Transaccion from "../ventas/domain/models/Transaccion.js";
import Cliente from "../ventas/domain/models/Cliente.js";
import EstadoTransaccion from "../ventas/domain/models/EstadoTransaccion.js";
import EstadoDetalleTransaccion from "../ventas/domain/models/EstadoDetalleTransaccion.js";
import TransicionEstadoDetalle from "../ventas/domain/models/TransicionEstadoDetalle.js";
import TransicionTipoTransaccion from "../ventas/domain/models/TransicionTipoTransaccion.js";
import EstadoFactura from "../ventas/domain/models/EstadoFactura.js";
import TransicionEstadoTransaccion from "../ventas/domain/models/TransicionEstadoTransaccion.js";
import Factura from "../ventas/domain/models/Factura.js";
import LogTransaccion from "../ventas/domain/models/LogTransaccion.js";

async function populateDatabase() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("Conexión establecida con éxito.");

    // Sincronizar modelos (solo en desarrollo)
    await sequelize.sync({ alter: true });
    /*****************************************************/
    console.log("Poblando la base de datos...");
    /******************************/
    //         Módulo AUTH        *
    /******************************/
    // Crear permisos
    const permisosAuth = [
      { nombre: "iniciar_sesion", descripcion: "Permiso para iniciar sesión" },
      { nombre: "ver_permisos", descripcion: "Permiso para ver permisos" },
      { nombre: "crear_permisos", descripcion: "Permiso para crear permisos" },
      {
        nombre: "eliminar_permisos",
        descripcion: "Permiso para eliminar permisos",
      },
      { nombre: "ver_roles", descripcion: "Permiso para ver roles" },
      { nombre: "crear_roles", descripcion: "Permiso para crear roles" },
      { nombre: "editar_roles", descripcion: "Permiso para editar roles" },
      { nombre: "eliminar_roles", descripcion: "Permiso para eliminar roles" },
      { nombre: "ver_usuarios", descripcion: "Permiso para ver usuarios" },
      { nombre: "ver_usuario", descripcion: "Permiso para ver usuario" },
      { nombre: "crear_usuarios", descripcion: "Permiso para crear usuarios" },
      {
        nombre: "editar_usuarios",
        descripcion: "Permiso para editar usuarios",
      },
      { nombre: "editar_usuario", descripcion: "Permiso para editar usuario" },
      {
        nombre: "eliminar_usuarios",
        descripcion: "Permiso para eliminar usuarios",
      },
    ];

    const permisosCreados = await Permisos.bulkCreate(permisosAuth);
    console.log("Permisos creados");

    // Crear roles
    const rolesData = [
      { nombre: "vendedor", descripcion: "Rol para vendedores" },
      { nombre: "administrador", descripcion: "Rol para administradores" },
      { nombre: "operario", descripcion: "Rol para operarios" },
      { nombre: "chofer", descripcion: "Rol para choferes" },
    ];

    const rolesCreados = await Roles.bulkCreate(rolesData);
    console.log("Roles creados");

    // Asignar permisos a roles
    const permisosPorRol = {
      vendedor: ["iniciar_sesion", "ver_usuarios"],
      administrador: [
        "iniciar_sesion",
        "ver_permisos",
        "crear_permisos",
        "eliminar_permisos",
        "ver_roles",
        "crear_roles",
        "editar_roles",
        "eliminar_roles",
        "ver_usuarios",
        "ver_usuario",
        "crear_usuarios",
        "editar_usuarios",
        "editar_usuario",
        "eliminar_usuarios",
      ],
      operario: ["iniciar_sesion"],
      chofer: ["iniciar_sesion"],
    };

    for (const [rolNombre, permisos] of Object.entries(permisosPorRol)) {
      const rol = rolesCreados.find((r) => r.nombre === rolNombre);
      const permisosIds = permisosCreados
        .filter((p) => permisos.includes(p.nombre))
        .map((p) => p.id);

      const relaciones = permisosIds.map((permisoId) => ({
        rolId: rol.id,
        permisoId,
      }));

      await RolesPermisos.bulkCreate(relaciones);
    }

    console.log("Permisos asignados a roles");

    // Crear usuarios
    const usuariosData = [
      {
        rut: "12345678-9",
        nombre: "Test1",
        apellido: "Test1",
        email: "test1.test@example.com",
        password:
          "$2a$12$hpZ1Dq.mAvJLKJhZyQq6Ie2FSYsWzx46WJcJFpBXWG/Tvxx2HPibG", // Asegúrate de encriptar las contraseñas en producción
        rolId: rolesCreados.find((r) => r.nombre === "administrador").id,
      },
      {
        rut: "98765432-1",
        nombre: "Test2",
        apellido: "Test2",
        email: "Test2.test@example.com",
        password:
          "$2a$12$hpZ1Dq.mAvJLKJhZyQq6Ie2FSYsWzx46WJcJFpBXWG/Tvxx2HPibG", // Asegúrate de encriptar las contraseñas en producción
        rolId: rolesCreados.find((r) => r.nombre === "vendedor").id,
      },
    ];

    await Usuarios.bulkCreate(usuariosData);
    console.log("Usuarios creados");
    /******************************/
    //     Módulo INVENTARIO      *
    /******************************/
    // Crear Estados productos
    const estados = [
      {
        nombre_estado: "Disponible - Bodega",
        descripcion: "Producto disponible en bodega.",
      },
      {
        nombre_estado: "En tránsito - Disponible",
        descripcion: "Producto disponible y en tránsito.",
      },
      { nombre_estado: "Fisuras", descripcion: "Producto con fisuras." },
      { nombre_estado: "Contaminado", descripcion: "Producto contaminado." },
      {
        nombre_estado: "Producción",
        descripcion: "Producto en etapa de producción.",
      },
      { nombre_estado: "Defectuoso", descripcion: "Producto defectuoso." },
      {
        nombre_estado: "Devuelto",
        descripcion: "Producto devuelto por el cliente.",
      },
    ];

    await EstadoProducto.bulkCreate(estados);
    console.log("Estados productos creados");

    // Crear Tipos de productos
    const tipos = [
      { nombre: "Producto_Terminado", descripcion: "Listo para la venta" },
      {
        nombre: "Insumo",
        descripcion: "Material para uso interno o producción",
      },
    ];

    await TipoProducto.bulkCreate(tipos);
    console.log("Tipos productos creados");

    // Crear Categorias de productos
    const categorias = [
      {
        nombre_categoria: "Botellones",
        descripcion: "Contenedores grandes de agua",
      },
      {
        nombre_categoria: "Hielo",
        descripcion: "Hielo en diferentes formatos",
      },
    ];

    await CategoriaProducto.bulkCreate(categorias);
    console.log("Categoria productos creadas");
    // Crear Productos
    const productos = [
      {
        nombre_producto: "Botellón de Agua 20L",
        marca: "Agua Pura",
        codigo_barra: "1234567890123",
        precio: 2000,
        descripcion: "Botellón reutilizable de 20 litros",
        id_categoria: 1,
        id_tipo_producto: 1, // Producto Terminado
        id_estado_producto: 1, // Disponible
      },
      {
        nombre_producto: "Hielo 2 Kilos",
        marca: "Hielos del Sur",
        codigo_barra: "9876543210987",
        precio: 1500,
        descripcion: "Bolsa de hielo de 2 kilos",
        id_categoria: 2,
        id_tipo_producto: 2, // Insumo
        id_estado_producto: 1, // Disponible
      },
    ];

    const productosCreados = await Producto.bulkCreate(productos);
    console.log("Productos creados exitosamente.");

    // Crear Inventarios de productos
    // Lista de cantidades iniciales
    const inventarios = [
      { id_producto: 1, cantidad: 100 }, // Producto con id_producto 1
      { id_producto: 2, cantidad: 2000 }, // Producto con id_producto 2
      // Agrega más productos según sea necesario
    ];

    // Asociar inventarios con los productos recién creados
    const inventariosFinales = productosCreados.map((producto, index) => ({
      id_producto: producto.id_producto,
      cantidad: inventarios[index].cantidad,
      fecha_actualizacion: new Date(),
    }));
    await Inventario.bulkCreate(inventariosFinales);
    console.log("Inventario inicial creado exitosamente.");
    // Transiciones FSM
    const transicionesEstado = [
      {
        id_producto: 1,
        id_estado_origen: 1,
        id_estado_destino: 2,
        id_usuario: "12345678-9",
        condicion: "",
      }, // Disponible -> Reservado
      {
        id_producto: 1,
        id_estado_origen: 2,
        id_estado_destino: 3,
        id_usuario: "12345678-9",
        condicion: "",
      }, // Reservado -> Disponible
      {
        id_producto: 1,
        id_estado_origen: 3,
        id_estado_destino: 1,
        id_usuario: "12345678-9",
        condicion: "",
      }, // Disponible -> Bodega
      {
        id_producto: 1,
        id_estado_origen: 1,
        id_estado_destino: 5,
        id_usuario: "12345678-9",
        condicion: "",
      }, // Bodega -> Contaminado
    ];

    await TransicionEstadoProducto.bulkCreate(transicionesEstado);
    console.log("Transiciones FSM creadas exitosamente.");

    await InventarioLog.bulkCreate([
      {
        id_producto: 1,
        id_transaccion: null,
        cambio: 100,
        motivo: "Stock inicial",
        fecha: new Date(),
        cantidad_final: 100,
        realizado_por: "Juan",
      },
      {
        id_producto: 2,
        id_transaccion: null,
        cambio: 50,
        motivo: "Stock inicial",
        fecha: new Date(),
        cantidad_final: 50,
        realizado_por: "Juan",
      },
    ]);
    console.log("InventarioLog inicial creado exitosamente.");
    /******************************/
    //       Módulo VENTAS        *
    /******************************/

    // Estados de Transacción
    const estadosTransaccion = [
      // Estados para Cotización
      {
        //1
        nombre_estado: "Creada",
        descripcion: "Estado inicial para cotizaciones.",
        tipo_transaccion: "cotizacion",
        es_inicial: true,
      },
      {
        //2
        nombre_estado: "Pendiente Aprobación",
        descripcion: "Esperando aprobación de cotización.",
        tipo_transaccion: "cotizacion",
        es_inicial: false,
      },
      {
        //3
        nombre_estado: "Aprobada",
        descripcion: "La cotización ha sido aprobada.",
        tipo_transaccion: "cotizacion",
        es_inicial: false,
      },
      {
        //4
        nombre_estado: "Expirada",
        descripcion: "La cotización ha expirado.",
        tipo_transaccion: "cotizacion",
        es_inicial: false,
      },
      {
        //5
        nombre_estado: "Rechazada",
        descripcion: "La cotización fue rechazada.",
        tipo_transaccion: "cotizacion",
        es_inicial: false,
      },

      // Estados para Pedido
      {
        //6
        nombre_estado: "Creado",
        descripcion: "Estado inicial para pedidos.",
        tipo_transaccion: "pedido",
        es_inicial: true,
      },
      {
        //7
        nombre_estado: "En Proceso",
        descripcion: "El pedido está siendo procesado.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },
      {
        //8
        nombre_estado: "Confirmado",
        descripcion: "El pedido ha sido confirmado.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },
      {
        //9
        nombre_estado: "Cancelado",
        descripcion: "El pedido fue cancelado.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },
      {
        //10
        nombre_estado: "Rechazado",
        descripcion: "El pedido fue rechazado.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },

      // Estados para Venta
      {
        //11
        nombre_estado: "En Proceso",
        descripcion: "La venta está en proceso.",
        tipo_transaccion: "venta",
        es_inicial: true,
      },
      {
        //11
        nombre_estado: "Pago Pendiente",
        descripcion: "Esperando pago para completar la venta.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        //12
        nombre_estado: "Pagada",
        descripcion: "La venta ha sido pagada completamente.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        //13
        nombre_estado: "Cancelada",
        descripcion: "La venta fue cancelada.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        //14
        nombre_estado: "Completada",
        descripcion: "La venta ha sido completada.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        //15
        nombre_estado: "Reembolsada",
        descripcion: "El importe de la venta fue reembolsado.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
    ];
    await EstadoTransaccion.bulkCreate(estadosTransaccion);
    console.log("Estados de Transacción creados exitosamente.");
    /*
     *
     * Transicion Estado Transacción
     *
     */
    const transicionesCotizacion = [
      {
        id_estado_origen: 1, // Creada
        id_estado_destino: 2, // Pendiente Aprobación
        condicion: "Cotización enviada al cliente.",
      },
      {
        id_estado_origen: 2, // Pendiente Aprobación
        id_estado_destino: 3, // Aprobada
        condicion: "Cliente aprueba la cotización.",
      },
      {
        id_estado_origen: 2, // Pendiente Aprobación
        id_estado_destino: 5, // Rechazada
        condicion: "Cliente rechaza la cotización.",
      },
      {
        id_estado_origen: 1, // Creada
        id_estado_destino: 4, // Expirada
        condicion: "Tiempo de validez de la cotización agotado.",
      },
      {
        id_estado_origen: 2, // Pendiente Aprobación
        id_estado_destino: 4, // Expirada
        condicion: "Tiempo de validez de la cotización agotado.",
      },
    ];

    // Transiciones para Pedido
    const transicionesPedido = [
      {
        id_estado_origen: 6, // Creado
        id_estado_destino: 7, // En Proceso
        condicion: "Pedido asignado a preparación.",
      },
      {
        id_estado_origen: 7, // En Proceso
        id_estado_destino: 8, // Confirmado
        condicion: "Pedido listo para entrega.",
      },
      {
        id_estado_origen: 6, // Creado
        id_estado_destino: 9, // Cancelado
        condicion: "Cliente cancela el pedido.",
      },
      {
        id_estado_origen: 7, // En Proceso
        id_estado_destino: 9, // Cancelado
        condicion: "Cliente cancela durante la preparación.",
      },
      {
        id_estado_origen: 6, // Creado
        id_estado_destino: 10, // Rechazado
        condicion: "Pedido no puede ser procesado.",
      },
    ];

    // Transiciones para Venta
    const transicionesVenta = [
      {
        id_estado_origen: 11, // En Proceso
        id_estado_destino: 12, // Pago Pendiente
        condicion: "Venta registrada, esperando pago.",
      },
      {
        id_estado_origen: 12, // Pago Pendiente
        id_estado_destino: 13, // Pagada
        condicion: "Pago recibido y acreditado.",
      },
      {
        id_estado_origen: 13, // Pagada
        id_estado_destino: 15, // Completada
        condicion: "Venta completada exitosamente.",
      },
      {
        id_estado_origen: 11, // En Proceso
        id_estado_destino: 14, // Cancelada
        condicion: "Cliente cancela la venta antes del pago.",
      },
      {
        id_estado_origen: 12, // Pago Pendiente
        id_estado_destino: 14, // Cancelada
        condicion: "Cliente cancela la venta.",
      },
      {
        id_estado_origen: 15, // Completada
        id_estado_destino: 16, // Reembolsada
        condicion: "Reembolso solicitado y procesado.",
      },
    ];

    // Combinar todas las transiciones
    const transiciones = [
      ...transicionesCotizacion,
      ...transicionesPedido,
      ...transicionesVenta,
    ];

    // Poblado de las transiciones
    await TransicionEstadoTransaccion.bulkCreate(transiciones);
    console.log(
      "Transiciones de Estados de Transacciones creadas exitosamente."
    );

    // Estado Pago
    const estadosPago = [
      { nombre: "Pendiente", descripcion: "El pago aún no se ha completado." },
      {
        nombre: "Pagado",
        descripcion: "El pago ha sido completado exitosamente.",
      },
      {
        nombre: "Rechazado",
        descripcion: "El pago fue rechazado por el método.",
      },
    ];
    await EstadoPago.bulkCreate(estadosPago);
    console.log("Estado Pago creado exitosamente.");
    // Método Pago
    const metodosPago = [
      { nombre: "Efectivo", descripcion: "Pago en efectivo." },
      {
        nombre: "Tarjeta_credito",
        descripcion: "Pago con tarjeta de crédito.",
      },
      { nombre: "Tarjeta_debito", descripcion: "Pago con tarjeta de débito." },
      { nombre: "Transferencia", descripcion: "Transferencia bancaria." },
    ];
    await MetodoPago.bulkCreate(metodosPago);
    console.log("Métodos Pago creado exitosamente.");

    // Clientes de Ejemplo
    const clientes = [
      {
        rut: "123456781-1",
        nombre: "Juan Pérez",
        tipo_cliente: "persona",
        email: "juan.perez@example.com",
        direccion: "avenida de prueba 1243",
        telefono: "+56912345678",
        activo: true,
      },
      {
        rut: "123456781-2",
        nombre: "Empresa ABC S.A.",
        tipo_cliente: "empresa",
        razon_social: "ABC S.A.",
        email: "contacto@abcsa.com",
        direccion: "avenida de prueba 1245",
        telefono: "+56298765432",
        activo: true,
      },
      {
        rut: "123456781-3",
        nombre: "María López",
        tipo_cliente: "persona",
        email: "maria.lopez@example.com",
        direccion: "avenida de prueba 1244",
        telefono: "+56987654321",
        activo: true,
      },
    ];
    await Cliente.bulkCreate(clientes);
    console.log("Clientes creados exitosamente.");

    // Ejemplo de Cotización
    const cotizacion = await Transaccion.create({
      id_cliente: "123456781-2", // ID de cliente existente
      id_usuario: "12345678-9", // ID de usuario existente (vendedor)
      tipo_transaccion: "cotizacion",
      id_estado_transaccion: 1, // Estado "Creada"
      total: 0,
      observaciones: "Cotización inicial para cliente.",
    });
    // Ejemplo de Venta
    const venta = await Transaccion.create({
      id_cliente: "123456781-1", // ID de cliente existente
      id_usuario: "12345678-9", // ID de usuario existente (administrador)
      tipo_transaccion: "venta",
      id_estado_transaccion: 11, // Estado "En Proceso"
      total: 0,
      observaciones: "Venta directa al cliente.",
    });
    // Crear Pago ejemplo
    const pagos = [
      {
        id_transaccion: 1,
        id_estado_pago: 1, // Pendiente
        id_metodo_pago: 2, // Tarjeta Crédito
        monto: 5000,
        referencia: "12345ABC",
      },
    ];
    await Pago.bulkCreate(pagos);
    console.log("Pago creado exitosamente.");

    // Estados Detalle Transacción
    const estadosDetalleTransaccion = [
      {
        nombre_estado: "En bodega - Disponible",
        descripcion: "Producto en bodega, listo para uso.",
      },
      {
        nombre_estado: "En bodega - Reservado",
        descripcion: "Producto reservado",
      },
      {
        nombre_estado: "En tránsito - Reservado",
        descripcion: "Reservado para un cliente en tránsito.",
      },
      {
        nombre_estado: "En tránsito - Disponible",
        descripcion: "En tránsito, pero no reservado.",
      },
      {
        nombre_estado: "Por entregar - Confirmado",
        descripcion: "Producto confirmado para entrega.",
      },
      {
        nombre_estado: "Entregado",
        descripcion: "Producto entregado.",
      },
      {
        nombre_estado: "Eliminado del proceso",
        descripcion: "Producto retirado del flujo activo.",
      },
    ];
    await EstadoDetalleTransaccion.bulkCreate(estadosDetalleTransaccion);
    console.log("Estados de Detalle de Transacción creados exitosamente.");
    /******************************/
    // Transiciones de Estado Detalle
    /******************************/
    const transicionesEstadoDetalle = [
      // Transición: De "En bodega - Disponible" a "En tránsito - Reservado"
      {
        id_estado_origen: 1, // En bodega - Disponible
        id_estado_destino: 2, // En tránsito - Reservado
        condicion: "Cliente confirmado",
      },

      // Transición: De "En bodega - Disponible" a "En tránsito - Disponible"
      {
        id_estado_origen: 1, // En bodega - Disponible
        id_estado_destino: 3, // En tránsito - Disponible
        condicion: "Asignado a ruta de reparto",
      },

      // Transición: De "En tránsito - Reservado" a "Por entregar - Confirmado"
      {
        id_estado_origen: 2, // En tránsito - Reservado
        id_estado_destino: 4, // Por entregar - Confirmado
        condicion: "Entrega confirmada por el chofer",
      },

      // Transición: De "En tránsito - Disponible" a "Por entregar - Confirmado"
      {
        id_estado_origen: 3, // En tránsito - Disponible
        id_estado_destino: 4, // Por entregar - Confirmado
        condicion: "Confirmación del cliente en ruta",
      },
      // Transición: De "Por entregar - Confirmado" a "Entregado"
      {
        id_estado_origen: 4, // Por entregar - Confirmado
        id_estado_destino: 5, // Producto entregado
        condicion: "Entregado el pedido",
      },
      // Transición: De "Por entregar - Confirmado" a "Eliminado del proceso"
      {
        id_estado_origen: 4, // Por entregar - Confirmado
        id_estado_destino: 6, // Eliminado del proceso
        condicion: "Cancelación de la entrega o error en el pedido",
      },

      // Transición: De "En bodega - Disponible" a "Eliminado del proceso"
      {
        id_estado_origen: 1, // En bodega - Disponible
        id_estado_destino: 6, // Eliminado del proceso
        condicion: "Decisión del operador o administrador",
      },

      // Transición: De "En tránsito - Reservado" a "Eliminado del proceso"
      {
        id_estado_origen: 2, // En tránsito - Reservado
        id_estado_destino: 6, // Eliminado del proceso
        condicion: "Error en el pedido o cancelación del cliente",
      },

      // Transición: De "En tránsito - Disponible" a "Eliminado del proceso"
      {
        id_estado_origen: 3, // En tránsito - Disponible
        id_estado_destino: 6, // Eliminado del proceso
        condicion: "Decisión del operador o error en el inventario",
      },
    ];
    await TransicionEstadoDetalle.bulkCreate(transicionesEstadoDetalle);
    console.log("Transiciones de Estado Detalle creadas.");
    /**
     * TransicionTipoTransaccion
     */
    const transicionesTipoTransaccion = [
      {
        tipo_origen: "cotizacion",
        tipo_destino: "pedido",
        condicion: "Cotización convertida a Pedido",
        estado_origen: 3,
        estado_destino: 6
      },
      {
        tipo_origen: "pedido",
        tipo_destino: "venta",
        condicion: "Pedido convertido en Venta",
        estado_origen: 8,
        estado_destino: 11
      },
      {
        tipo_origen: "cotizacion",
        tipo_destino: "venta",
        condicion: "Cotización convertida directamente en Venta",
        estado_origen: 3,
        estado_destino: 11
      },
    ];
    await TransicionTipoTransaccion.bulkCreate(transicionesTipoTransaccion);
    console.log("Transiciones de Tipo Transacción creadas.");

    // Estados de Factura
    const estadosFactura = [
      { nombre: "Creada", descripcion: "Factura creada en el sistema." },
      { nombre: "Enviada", descripcion: "Factura enviada al cliente." },
      { nombre: "Aceptada", descripcion: "Factura aceptada por el cliente." },
      {
        nombre: "Pendiente de Pago",
        descripcion: "Factura pendiente de pago.",
      },
      { nombre: "Pagada", descripcion: "Factura completamente pagada." },
      { nombre: "Vencida", descripcion: "Factura no pagada a tiempo." },
      { nombre: "Cancelada", descripcion: "Factura anulada." },
      { nombre: "Rechazada", descripcion: "Factura rechazada por el cliente." },
    ];

    await EstadoFactura.bulkCreate(estadosFactura);
    console.log("Estados de Factura creados exitosamente.");
    /***********************************************************************************/
    console.log("Creando transacciones de ejemplo...");

    
    const detallesCotizacion = [
      {
        id_transaccion: cotizacion.id_transaccion,
        id_producto: 1, // Botellón de Agua 20L
        cantidad: 5,
        precio_unitario: 2000,
        descuento: 0,
        subtotal: 10000,
        estado_producto_transaccion: 1, // Estado "En bodega - Disponible"
      },
      {
        id_transaccion: cotizacion.id_transaccion,
        id_producto: 2, // Hielo 2 Kilos
        cantidad: 10,
        precio_unitario: 1500,
        descuento: 0,
        subtotal: 15000,
        estado_producto_transaccion: 1, // Estado "En bodega - Disponible"
      },
    ];
    await DetalleTransaccion.bulkCreate(detallesCotizacion);

    await LogTransaccion.create({
      id_transaccion: cotizacion.id_transaccion,
      id_usuario: "12345678-9", // administrador
      accion: "Creación de cotización",
      estado: "Creada",
      detalles: "Cotización creada con detalles iniciales.",
    });

    console.log("Cotización creada con éxito.");

    const detallesVenta = [
      {
        id_transaccion: venta.id_transaccion,
        id_producto: 1, // Botellón de Agua 20L
        cantidad: 3,
        precio_unitario: 2000,
        descuento: 0,
        subtotal: 6000,
        estado_producto_transaccion: 2, // Estado "En tránsito - Reservado"
      },
      {
        id_transaccion: venta.id_transaccion,
        id_producto: 2, // Hielo 2 Kilos
        cantidad: 5,
        precio_unitario: 1500,
        descuento: 0,
        subtotal: 7500,
        estado_producto_transaccion: 2, // Estado "En tránsito - Reservado"
      },
    ];
    await DetalleTransaccion.bulkCreate(detallesVenta);

    await LogTransaccion.create({
      id_transaccion: venta.id_transaccion,
      numero_factura: "000001",
      id_usuario: "12345678-9", // Administrador
      accion: "Creación de venta",
      estado: "En Proceso",
      detalles: "Venta creada y en proceso de preparación.",
    });

    await Factura.create({
      id_transaccion: venta.id_transaccion,
      numero_factura: "000001",
      id_cliente: venta.id_cliente,
      id_estado_factura: 1, // Estado "Creada"
      total: venta.total,
      referencia_pago: "12345XYZ", // Referencia de pago
      observaciones: "Factura generada automáticamente para la venta.",
    });

    console.log("Venta y factura creadas con éxito.");
    /***********************************************************************************/
    console.log("Base de datos poblada con éxito.");
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
  } finally {
    await sequelize.close();
    console.log("Conexión cerrada.");
  }
}

populateDatabase();

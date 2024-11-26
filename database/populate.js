import sequelize from "./database.js";
import Usuarios from "../auth/domain/models/Usuarios.js";
import Roles from "../auth/domain/models/Roles.js";
import Permisos from "../auth/domain/models/Permisos.js";
import RolesPermisos from "../auth/domain/models/RolesPermisos.js";
import EstadoProducto from "../inventario/domain/models/EstadoProducto.js";
import Producto from "../inventario/domain/models/Producto.js";
import TipoProducto from "../inventario/domain/models/TipoProducto.js";
import Inventario from "../inventario/domain/models/Inventario.js";
import CategoriaProducto from "../inventario/domain/models/CategoriaProducto.js";
import EstadoPago from "../ventas/domain/models/EstadoPago.js";
import MetodoPago from "../ventas/domain/models/MetodoPago.js";
import Pago from "../ventas/domain/models/Pago.js";
import DetalleTransaccion from "../ventas/domain/models/DetalleTransaccion.js";
import Transaccion from "../ventas/domain/models/Transaccion.js";
import Cliente from "../ventas/domain/models/Cliente.js";
import EstadoTransaccion from "../ventas/domain/models/EstadoTransaccion.js";
import TransicionEstadoProducto from "../inventario/domain/models/TransicionEstadoProducto.js";
import InventarioLog from "../inventario/domain/models/InventarioLogs.js";

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
        nombre: "Disponible - Bodega",
        descripcion: "Producto disponible en bodega.",
      },
      {
        nombre: "En tránsito - Reservado",
        descripcion: "Producto reservado y en tránsito.",
      },
      {
        nombre: "En tránsito - Disponible",
        descripcion: "Producto disponible y en tránsito.",
      },
      { nombre: "Fisuras", descripcion: "Producto con fisuras." },
      { nombre: "Contaminado", descripcion: "Producto contaminado." },
      { nombre: "Producción", descripcion: "Producto en etapa de producción." },
      { nombre: "Defectuoso", descripcion: "Producto defectuoso." },
      { nombre: "Devuelto", descripcion: "Producto devuelto por el cliente." },
    ];

    await EstadoProducto.bulkCreate(estados);
    console.log("Estados productos creados");

    // Transiciones FSM
    const transicionesEstado = [
      {
        id_producto: 1,
        id_estado_origen: 1,
        id_estado_destino: 2,
        comentarios: "Asignado a cliente, pendiente de entrega.",
        id_usuario: "12345678-9",
        condicion: "",
      }, // Disponible -> Reservado
      {
        id_producto: 1,
        id_estado_origen: 2,
        id_estado_destino: 3,
        comentarios: "Producto ahora disponible para otros clientes.",
        id_usuario: "12345678-9",
        condicion: "",
      }, // Reservado -> Disponible
      {
        id_producto: 1,
        id_estado_origen: 3,
        id_estado_destino: 1,
        comentarios: "Regreso a bodega después de recolección.",
        id_usuario: "12345678-9",
        condicion: "",
      }, // Disponible -> Bodega
      {
        id_producto: 1,
        id_estado_origen: 1,
        id_estado_destino: 5,
        comentarios: "Producto contaminado durante transporte.",
        id_usuario: "12345678-9",
        condicion: "",
      }, // Bodega -> Contaminado
    ];

    await TransicionEstadoProducto.bulkCreate(transicionesEstado);
    console.log("Transiciones FSM creadas exitosamente.");

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

    await InventarioLog.bulkCreate([
      {
        id_producto: 1,
        id_transaccion: null,
        cambio: 100,
        motivo: "Stock inicial",
        fecha: new Date(),
      },
      {
        id_producto: 2,
        id_transaccion: null,
        cambio: 50,
        motivo: "Stock inicial",
        fecha: new Date(),
      },
    ]);
    console.log("InventarioLog inicial creado exitosamente.");
    /******************************/
    //       Módulo VENTAS        *
    /******************************/

    // Estados de Transacción
    const estadosTransaccion = [
      {
        nombre_estado: "Facturación Incompleta",
        descripcion: "Faltan datos de la factura.",
      },
      {
        nombre_estado: "En Proceso",
        descripcion: "La transacción está en curso.",
      },
      {
        nombre_estado: "Pago Pendiente",
        descripcion: "La transacción espera el pago.",
      },
      {
        nombre_estado: "Completada",
        descripcion: "La transacción fue completada.",
      },
      {
        nombre_estado: "Cancelada",
        descripcion: "La transacción fue cancelada.",
      },
      {
        nombre_estado: "Errónea",
        descripcion: "La transacción está errónea.",
      },
      {
        nombre_estado: "Eliminada",
        descripcion:
          "La transacción ha sido eliminada del sistema de manera lógica.",
      },
    ];
    await EstadoTransaccion.bulkCreate(estadosTransaccion);
    console.log("Estados de Transacción creados exitosamente.");

    // Estado Pago
    const estadosPago = [
      { nombre: "pendiente", descripcion: "El pago aún no se ha completado." },
      {
        nombre: "pagado",
        descripcion: "El pago ha sido completado exitosamente.",
      },
      {
        nombre: "rechazado",
        descripcion: "El pago fue rechazado por el método.",
      },
    ];
    await EstadoPago.bulkCreate(estadosPago);
    console.log("Estado Pago creado exitosamente.");
    // Método Pago
    const metodosPago = [
      { nombre: "efectivo", descripcion: "Pago en efectivo." },
      {
        nombre: "tarjeta_credito",
        descripcion: "Pago con tarjeta de crédito.",
      },
      { nombre: "tarjeta_debito", descripcion: "Pago con tarjeta de débito." },
      { nombre: "transferencia", descripcion: "Transferencia bancaria." },
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

    // Transacción de Ejemplo
    const transacciones = [
      {
        tipo_transaccion: "cotizacion",
        id_cliente: "123456781-1", // Juan Pérez
        id_usuario: "12345678-9", // Asume un usuario administrador
        id_estado_transaccion: 2, // En Proceso
        total: 0,
        observaciones: "Cotización inicial para cliente.",
      },
      {
        tipo_transaccion: "venta",
        id_cliente: "123456781-2", // Empresa ABC S.A.
        id_usuario: "98765432-1", // Asume un usuario vendedor
        id_estado_transaccion: 3, // Pago Pendiente
        total: 10000,
        observaciones: "Venta inicial.",
      },
    ];
    await Transaccion.bulkCreate(transacciones);
    console.log("Transacciones creadas exitosamente.");

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

    // Detalles de Transacciones
    const detallesTransacciones = [
      {
        id_transaccion: 1, // Cotización
        id_producto: 1, // Botellón de Agua 20L
        cantidad: 5,
        precio_unitario: 2000,
      },
      {
        id_transaccion: 2, // Venta
        id_producto: 2, // Hielo 2 Kilos
        cantidad: 10,
        precio_unitario: 1500,
      },
    ];
    await DetalleTransaccion.bulkCreate(detallesTransacciones);
    console.log("Detalles de Transacciones creados exitosamente.");
    /*****************************************************/
    console.log("Base de datos poblada con éxito.");
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
  } finally {
    await sequelize.close();
    console.log("Conexión cerrada.");
  }
}

populateDatabase();

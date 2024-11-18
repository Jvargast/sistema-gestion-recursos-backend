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

async function populateDatabase() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("Conexión establecida con éxito.");

    // Sincronizar modelos (solo en desarrollo)
    await sequelize.sync({ alter: true });

    console.log("Poblando la base de datos...");
    //Módulo AUTH
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
          "$2a$12$ZQOo2VA.6BlbgEmytQhwFufRd8bwkqD9DrV01mAdM/sELMuvfNfp.", // Asegúrate de encriptar las contraseñas en producción
        rolId: rolesCreados.find((r) => r.nombre === "administrador").id,
      },
      {
        rut: "98765432-1",
        nombre: "Test2",
        apellido: "Test2",
        email: "Test2.test@example.com",
        password:
          "$2a$12$ZQOo2VA.6BlbgEmytQhwFufRd8bwkqD9DrV01mAdM/sELMuvfNfp.", // Asegúrate de encriptar las contraseñas en producción
        rolId: rolesCreados.find((r) => r.nombre === "vendedor").id,
      },
    ];

    await Usuarios.bulkCreate(usuariosData);
    console.log("Usuarios creados");

    //Módulo INVENTARIO
    // Crear Estados productos
    const estados = [
      {
        nombre_estado: "Disponible",
        descripcion: "Producto disponible en inventario",
      },
      { nombre_estado: "En_Transito", descripcion: "Producto en movimiento" },
      { nombre_estado: "Fisuras", descripcion: "Producto dañado" },
      { nombre_estado: "Contaminado", descripcion: "Producto no usable" },
      { nombre_estado: "Vendido", descripcion: "Producto vendido" },
      { nombre_estado: "Producción", descripcion: "Producto en producción" },
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
      { nombre_categoria: 'Botellones', descripcion: 'Contenedores grandes de agua' },
      { nombre_categoria: 'Hielo', descripcion: 'Hielo en diferentes formatos' },
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

    console.log("Base de datos poblada con éxito.");
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
  } finally {
    await sequelize.close();
    console.log("Conexión cerrada.");
  }
}

populateDatabase();

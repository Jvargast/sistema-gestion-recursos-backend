import sequelize from "./database.js";
import todosLosPermisos from "./permisos/index.js";
import permisosDependencias from "./permisosDependencias/index.js";

/**
 * Módulo Usuarios 4
 */
import Usuarios from "../auth/domain/models/Usuarios.js";
import Roles from "../auth/domain/models/Roles.js";
import Permisos from "../auth/domain/models/Permisos.js";
import PermisosDependencias from "../auth/domain/models/PermisosDependencias.js";
import RolesPermisos from "../auth/domain/models/RolesPermisos.js";
import Empresa from "../auth/domain/models/Empresa.js";
import Sucursal from "../auth/domain/models/Sucursal.js";
/**
 * Módulo Inventario 7
 */
import EstadoProducto from "../inventario/domain/models/EstadoProducto.js";
import TipoInsumo from "../inventario/domain/models/TipoInsumo.js";
import CategoriaProducto from "../inventario/domain/models/CategoriaProducto.js";
/**
 * Módulo Ventas 14
 */
import EstadoPago from "../ventas/domain/models/EstadoPago.js";
import MetodoPago from "../ventas/domain/models/MetodoPago.js";
import EstadoVenta from "../ventas/domain/models/EstadoVenta.js";
import permisosPorRol from "./permisosPorRol/index.js";

async function populateDatabase() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("✅ Conexión establecida con éxito.");

    // Sincronizar modelos (solo en desarrollo)
    await sequelize.sync({ alter: true });
    /*****************************************************/
    console.log("✅ Poblando la base de datos...");
    /******************************/
    //         Módulo AUTH        *
    /******************************/
    // Crear permisos - versión legacy
    const permisosAuth = [
      // Autenticación
      {
        nombre: "iniciar_sesion",
        descripcion: "Permiso para iniciar sesión",
        categoria: "Autenticación",
      },

      // Gestión de Usuarios
      {
        nombre: "ver_administrador",
        descripcion: "Permiso ver panel de administración",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "crear_usuarios",
        descripcion: "Permiso para crear usuarios",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "editar_usuario",
        descripcion: "Permiso para editar usuario",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "editar_usuarios",
        descripcion: "Permiso para editar usuarios",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "ver_usuarios",
        descripcion: "Permiso para ver usuarios",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "ver_usuario",
        descripcion: "Permiso para ver usuario",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "eliminar_usuarios",
        descripcion: "Permiso para eliminar usuarios",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "eliminar_usuario",
        descripcion: "Permiso para eliminar usuario",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "dar_de_baja_usuarios",
        descripcion: "Permiso para dar de baja a usuarios",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "dar_de_baja_usuario",
        descripcion: "Permiso para dar de baja a usuario",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "restaurar_usuario_de_baja",
        descripcion: "Permiso para restaurar usuario que fue dado de baja",
        categoria: "Gestión de Usuarios",
      },
      {
        nombre: "auditar_actividad_usuario",
        descripcion: "Permiso para auditar actividad de usuario",
        categoria: "Gestión de Usuarios",
      },
      // Gestión de Permisos y Roles
      {
        nombre: "crear_permisos",
        descripcion: "Permiso para crear permisos",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "ver_permisos",
        descripcion: "Permiso para ver permisos",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "editar_permisos",
        descripcion: "Permiso para editar permisos",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "eliminar_permisos",
        descripcion: "Permiso para eliminar permisos",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "crear_roles",
        descripcion: "Permiso para crear roles",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "asignar_roles",
        descripcion: "Permiso para asignar roles",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "editar_roles",
        descripcion: "Permiso para editar roles",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "ver_roles",
        descripcion: "Permiso para ver roles",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "eliminar_roles",
        descripcion: "Permiso para eliminar roles",
        categoria: "Gestión de Permisos y Roles",
      },
      {
        nombre: "ver_rol_y_permisos_asignados",
        descripcion: "Permiso para ver roles y permisos asignados",
        categoria: "Gestión de Permisos y Roles",
      },

      // Gestión de Inventario
      {
        nombre: "ver_inventario",
        descripcion: "Permiso para ver inventario",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "ver_inventario_camion",
        descripcion: "Permiso para ver el inventario del camión",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "agregar_productos_inventario",
        descripcion: "Permiso para agregar productos al inventario",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "visualizar_nivel_stock_inventario",
        descripcion:
          "Permiso para visualizar los niveles de stock del inventario",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "editar_inventario",
        descripcion: "Permiso para editar el inventario",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "agregar_categoria_producto",
        descripcion: "Permiso para agregar categorías de productos",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "realizar_auditoria_inventario",
        descripcion: "Permiso para realizar auditoría del inventario",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "reportar_stock_danado",
        descripcion: "Permiso para reportar el stock dañado",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "historial_modificaciones_de_inventario",
        descripcion:
          "Permiso para ver historial de modificaciones del inventario",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "ver_producto",
        descripcion: "Permiso para ver un producto",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "ver_productos_disponibles",
        descripcion: "Permiso para ver productos disponibles",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "crear_producto",
        descripcion: "Permiso para crear un producto",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "editar_producto",
        descripcion: "Permiso para editar un producto",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "borrar_producto",
        descripcion: "Permiso para borrar un producto",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "borrar_productos",
        descripcion: "Permiso para borrar productos",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "ver_insumo",
        descripcion: "Permiso para ver un insumo",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "ver_insumos_disponibles",
        descripcion: "Permiso para ver insumos disponibles",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "crear_insumo",
        descripcion: "Permiso para crear un insumo",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "editar_insumo",
        descripcion: "Permiso para editar un insumo",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "borrar_insumo",
        descripcion: "Permiso para borrar un insumo",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "borrar_insumos",
        descripcion: "Permiso para borrar insumos",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "crear_tipo_insumo",
        descripcion: "Permiso para crear tipo de insumo",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "editar_tipo_insumo",
        descripcion: "Permiso para editar tipo de insumo",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "borrar_tipo_insumo",
        descripcion: "Permiso para borrar tipo de insumo",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "crear_categoria",
        descripcion: "Permiso para crear categoria",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "editar_categoria",
        descripcion: "Permiso para editar categoria",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "borrar_categoria",
        descripcion: "Permiso para borrar categoria",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "ver_producto_retornable",
        descripcion: "Permiso para ver producto retornable",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "crear_producto_retornable",
        descripcion: "Permiso para crear producto retornable",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "editar_producto_retornable",
        descripcion: "Permiso para editar producto retornable",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "ver_productos_retornables",
        descripcion: "Permiso para ver productos retornable",
        categoria: "Gestión de Inventario",
      },
      {
        nombre: "borrar_producto_retornable",
        descripcion: "Permiso para ver productos retornable",
        categoria: "Gestión de Inventario",
      },
      // Gestión proveedores
      {
        nombre: "gestionar_proveedores",
        descripcion: "Permiso para registrar y actualizar datos de proveedores",
        categoria: "Gestión de Proveedores",
      },

      {
        nombre: "ver_proveedor",
        descripcion: "Permiso para ver proveedor",
        categoria: "Gestión de Proveedores",
      },
      {
        nombre: "eliminar_proveedores",
        descripcion: "Permiso para eliminar proveedores",
        categoria: "Gestión de Proveedores",
      },

      // Gestión de Producción
      {
        nombre: "gestionar_insumos",
        descripcion:
          "Permiso para gestionar las materias primas necesarias para la producción",
        categoria: "Gestión de Producción",
      },
      {
        nombre: "control_de_desperdicios",
        descripcion:
          "Permiso para registrar y analizar productos defectuosos o desperdiciados",
        categoria: "Gestión de Producción",
      },
      {
        nombre: "ver_produccion",
        descripcion: "Permiso para ver producción",
        categoria: "Gestión de Producción",
      },
      {
        nombre: "visualizar_datos_produccion",
        descripcion: "Permiso para visualizar los datos de producción",
        categoria: "Gestión de Producción",
      },
      {
        nombre: "configurar_objetivos_produccion",
        descripcion: "Permiso para configurar objetivos de producción",
        categoria: "Gestión de Producción",
      },
      {
        nombre: "registrar_lotes_produccion",
        descripcion: "Permiso para registrar lotes de producción",
        categoria: "Gestión de Producción",
      },
      //Gestión de Ventas
      {
        nombre: "registrar_ventas",
        descripcion: "Permiso para registrar ventas",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "editar_ventas",
        descripcion: "Permiso para editar ventas",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "registrar_ventas_programadas",
        descripcion: "Permiso para registrar ventas programadas",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "control_de_comisiones",
        descripcion:
          "Permiso para calcular y gestionar comisiones de los vendedores",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "configurar_precios_y_descuentos",
        descripcion: "Permiso para configurar precios y descuentos",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "visualizar_historial_ventas",
        descripcion: "Permiso para visualizar historial de ventas",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "registrar_pagos",
        descripcion: "Permiso para registrar pagos",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "generar_facturas",
        descripcion: "Permiso para generar facturas",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "generar_metas_ventas",
        descripcion: "Permiso para generar metas u objetivos en ventas",
        categoria: "Gestión de Ventas",
      },
      {
        nombre: "aprobar_devoluciones",
        descripcion: "Permiso para aprobrar devoluciones",
        categoria: "Gestión de Ventas",
      },

      //Gestión de Clientes
      {
        nombre: "crear_cliente",
        descripcion: "Permiso para crear cliente",
        categoria: "Gestión de Clientes",
      },
      {
        nombre: "editar_cliente",
        descripcion: "Permiso para editar cliente",
        categoria: "Gestión de Clientes",
      },
      {
        nombre: "ver_cliente",
        descripcion: "Permiso para ver cliente",
        categoria: "Gestión de Clientes",
      },
      {
        nombre: "visualizar_historial_cliente",
        descripcion: "Permiso para visualizar historial de cliente",
        categoria: "Gestión de Clientes",
      },
      {
        nombre: "configurar_nivel_cliente",
        descripcion:
          "Permiso para crear niveles de categorias de clientes como mayorista o minorista para personalizar precios y/o descuentos",
        categoria: "Gestión de Clientes",
      },

      //Gestión de Rutas/Logística
      {
        nombre: "ver_rutas",
        descripcion: "Permiso para ver rutas",
        categoria: "Gestión de Rutas/Logística",
      },
      {
        nombre: "asignar_entregas",
        descripcion: "Permiso para asignar entregas a chofer",
        categoria: "Gestión de Rutas/Logística",
      },
      {
        nombre: "marcar_entrega_como_finalizada",
        descripcion: "Permiso para marcar entrega como finalizada",
        categoria: "Gestión de Rutas/Logística",
      },
      {
        nombre: "ver_estado_entrega",
        descripcion: "Permiso para ver el estado de la entrega",
        categoria: "Gestión de Rutas/Logística",
      },
      {
        nombre: "ver_estado_chofer",
        descripcion: "Permiso para ver el estado del chofer",
        categoria: "Gestión de Rutas/Logística",
      },
      {
        nombre: "registrar_incidencia_en_ruta",
        descripcion: "Permiso para registrar incidencia en ruta",
        categoria: "Gestión de Rutas/Logística",
      },
      {
        nombre: "generar_reporte_de_ruta",
        descripcion:
          "Permiso para generar reportes sobre tiempos de entrega y desempeño de rutas",
        categoria: "Gestión de Rutas/Logística",
      },

      //Reportes
      {
        nombre: "generar_reporte_inventario",
        descripcion: "Permiso para generar reportes de inventario",
        categoria: "Gestión de Reportes",
      },
      {
        nombre: "generar_reporte_ventas",
        descripcion: "Permiso para generar reportes de ventas",
        categoria: "Gestión de Reportes",
      },
      {
        nombre: "visualizar_reportes",
        descripcion: "Permiso para visualizar reportes",
        categoria: "Gestión de Reportes",
      },
      {
        nombre: "exportar_reportes",
        descripcion: "Permiso para exportar reportes",
        categoria: "Gestión de Reportes",
      },

      //Configuración general
      {
        nombre: "ver_perfil",
        descripcion: "Permiso para ver perfil",
        categoria: "Configuración General",
      },
      {
        nombre: "editar_perfil",
        descripcion: "Permiso para editar perfil",
        categoria: "Configuración General",
      },
      {
        nombre: "configurar_perfil_usuario",
        descripcion: "Permiso para configurar perfil de usuario",
        categoria: "Configuración General",
      },
      {
        nombre: "configurar_parametros_del_sistema",
        descripcion: "Permiso para configurar parametros del sistema",
        categoria: "Configuración General",
      },
      {
        nombre: "editar_ajustes_de_la_interfaz",
        descripcion: "Permiso para editar ajustes de la interfaz",
        categoria: "Configuración General",
      },
      {
        nombre: "ver_sucursales",
        descripcion: "Permiso para ver sucursales.",
        categoria: "Configuración General",
      },
      {
        nombre: "ver_sucursal",
        descripcion: "Permiso para ver sucursal.",
        categoria: "Configuración General",
      },
      {
        nombre: "buscar_sucursal",
        descripcion: "Permiso para ver buscar sucursal por nombre.",
        categoria: "Configuración General",
      },
      {
        nombre: "actualizar_sucursal",
        descripcion: "Permiso para actualizar sucursal.",
        categoria: "Configuración General",
      },
      {
        nombre: "ver_empresas",
        descripcion: "Permiso para ver las empresas.",
        categoria: "Configuración General",
      },
      {
        nombre: "ver_empresa",
        descripcion: "Permiso para ver empresa.",
        categoria: "Configuración General",
      },
      {
        nombre: "ver_empresa_nombre",
        descripcion: "Permiso para ver empresa por nombre.",
        categoria: "Configuración General",
      },
      {
        nombre: "ver_empresa_usuario",
        descripcion: "Permiso para ver empresa por usuario.",
        categoria: "Configuración General",
      },
      {
        nombre: "editar_empresa",
        descripcion: "Permiso para actualizar empresa.",
        categoria: "Configuración General",
      },

      //Gestión de Seguridad y Auditoría
      {
        nombre: "configurar_permisos_avanzados",
        descripcion: "Permiso para configurar permisos avanzados",
        categoria: "Gestión de Seguridad y Auditoría",
      },
      {
        nombre: "realizar_copias_de_seguridad",
        descripcion: "Permiso para realizar copias de seguridad",
        categoria: "Gestión de Seguridad y Auditoría",
      },
      {
        nombre: "acceso_a_log_del_sistema",
        descripcion: "Permiso para acceder al log del sistema",
        categoria: "Gestión de Seguridad y Auditoría",
      },
      {
        nombre: "autenticacion_dos_factores",
        descripcion: "Permiso para configurar autenticación de dos factores",
        categoria: "Gestión de Seguridad y Auditoría",
      },
      {
        nombre: "auditar_intentos_fallidos",
        descripcion:
          "Permiso para auditar intentos fallidos de inicio de sesión",
        categoria: "Gestión de Seguridad y Auditoría",
      },

      // Gestión de Vistas Permitidas
      {
        nombre: "ver_dashboard",
        descripcion: "Permiso para ver dashboard",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_facturas",
        descripcion: "Permiso para ver facturas",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_pagos",
        descripcion: "Permiso para ver pagos",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_cotizaciones",
        descripcion: "Permiso para ver cotizaciones",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_pedidos",
        descripcion: "Permiso para ver pedidos",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_ventas",
        descripcion: "Permiso para ver ventas",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_clientes",
        descripcion: "Permiso para ver clientes",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_productos",
        descripcion: "Permiso para ver productos",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_proveedores",
        descripcion: "Permiso para ver proveedores",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_insumos",
        descripcion: "Permiso para ver insumos",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_tipo_insumo",
        descripcion: "Permiso para ver tipos de insumo",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_categorias",
        descripcion: "Permiso para ver categorias",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_ventas_chofer",
        descripcion: "Permiso para ver ventas chofer",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_entregas_realizadas",
        descripcion: "Permiso para ver entregas realizadas",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_entregas",
        descripcion: "Permiso para ver entregas",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_entregas_asignadas",
        descripcion: "Permiso para ver entregas asignadas",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_camiones",
        descripcion: "Permiso para ver camiones",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_agenda_carga",
        descripcion: "Permiso para ver agendas carga",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_estadisticas",
        descripcion: "Permiso para ver estadisticas",
        categoria: "Gestión de Vistas Permitidas",
      },
      {
        nombre: "ver_admin",
        descripcion: "Permiso para ver panel administración",
        categoria: "Gestión de Vistas Permitidas",
      },
    ];
    /*  
    const permisosCreados = await Permisos.bulkCreate(permisosAuth);
    console.log("Permisos creados");
    */
    // 1. Crear permisos
    await Permisos.bulkCreate(todosLosPermisos, {
      ignoreDuplicates: true,
    });
    console.log("✅ Permisos creados exitosamente");

    // 2. Crear mapa de permisos
    const permisosExistentes = await Permisos.findAll();
    const mapaPermisos = new Map(
      permisosExistentes.map((p) => [p.nombre, p.id])
    );

    // 3. Procesar dependencias
    const dependenciasValidas = [];

    for (const dep of permisosDependencias) {
      const permisoId = mapaPermisos.get(dep.permiso);

      // Normaliza dependeDe: puede ser string o array
      const dependeDeArray = Array.isArray(dep.dependeDe)
        ? dep.dependeDe
        : typeof dep.dependeDe === "string"
        ? dep.dependeDe.split(",").map((d) => d.trim())
        : [];

      if (!permisoId || dependeDeArray.length === 0) {
        console.warn(
          `❌ Permiso o dependeDe inválido para ${dep.permiso}:`,
          dep.dependeDe
        );
        continue;
      }

      for (const dependeDe of dependeDeArray) {
        const dependeDeId = mapaPermisos.get(dependeDe);

        if (!dependeDeId) {
          console.warn(
            `❌ Permiso faltante en dependencias: permiso="${dep.permiso}", dependeDe="${dependeDe}"`
          );
          continue;
        }

        dependenciasValidas.push({
          permisoId,
          dependeDeId,
        });
      }
    }

    await PermisosDependencias.bulkCreate(dependenciasValidas, {
      ignoreDuplicates: true,
    });
    console.log("✅ Dependencias de permisos registradas exitosamente.");

    // 4. Crear roles
    const rolesData = [
      { nombre: "vendedor", descripcion: "Rol para vendedores" },
      { nombre: "administrador", descripcion: "Rol para administradores" },
      { nombre: "operario", descripcion: "Rol para operarios" },
      { nombre: "chofer", descripcion: "Rol para choferes" },
    ];

    const rolesCreados = await Roles.bulkCreate(rolesData);
    console.log("✅ Roles creados");

    // 5. Asignación de permisos por rol
    for (const rol of rolesCreados) {
      const permisosDelRol = permisosPorRol[rol.nombre];

      if (!permisosDelRol) continue;

      const relaciones = permisosDelRol
        .map((nombrePermiso) => {
          const permisoId = mapaPermisos.get(nombrePermiso);
          if (!permisoId) {
            console.warn(
              `⚠️ Permiso no encontrado para rol ${rol.nombre}: ${nombrePermiso}`
            );
            return null;
          }

          return {
            rolId: rol.id,
            permisoId,
          };
        })
        .filter(Boolean);

      if (relaciones.length > 0) {
        await RolesPermisos.bulkCreate(relaciones, { ignoreDuplicates: true });
        console.log(`✅ Permisos asignados a rol: ${rol.nombre}`);
      } else {
        console.warn(`⚠️ No se asignaron permisos al rol ${rol.nombre}`);
      }
    }

    // Asignar permisos a roles - legacy
    /*  const permisosPorRol = {
      vendedor: [
        "iniciar_sesion",
        "ver_inventario",
        "ver_inventario_camion",
        "visualizar_nivel_stock_inventario",
        "editar_inventario",
        "agregar_categoria_producto",
        "realizar_auditoria_inventario",
        "reportar_stock_danado",
        "gestionar_insumos",
        "control_de_desperdicios",
        "ver_produccion",
        "visualizar_datos_produccion",
        "registrar_ventas",
        "editar_ventas",
        "registrar_ventas_programadas",
        "visualizar_historial_ventas",
        "registrar_pagos",
        "crear_cliente",
        "editar_cliente",
        "ver_cliente",
        "visualizar_historial_cliente",
        "configurar_nivel_cliente",
        "asignar_entregas",
        "marcar_entrega_como_finalizada",
        "ver_estado_entrega",
        "ver_estado_chofer",
        "generar_reporte_inventario",
        "generar_reporte_ventas",
        "visualizar_reportes",
        "exportar_reportes",
        "ver_perfil",
        "editar_perfil",
        "configurar_perfil_usuario",
        "autenticacion_dos_factores",
        "ver_pedidos",
        "ver_ventas",
        "ver_clientes",
        "ver_productos",
        "ver_insumos",
        "ver_categorias",
      ],
      administrador: [
        "iniciar_sesion",
        "ver_administrador",
        "crear_usuarios",
        "editar_usuario",
        "editar_usuarios",
        "ver_usuarios",
        "ver_usuario",
        "eliminar_usuarios",
        "eliminar_usuario",
        "dar_de_baja_usuarios",
        "dar_de_baja_usuario",
        "restaurar_usuario_de_baja",
        "auditar_actividad_usuario",
        "crear_permisos",
        "ver_permisos",
        "editar_permisos",
        "eliminar_permisos",
        "crear_roles",
        "asignar_roles",
        "editar_roles",
        "ver_roles",
        "eliminar_roles",
        "ver_rol_y_permisos_asignados",
        "ver_inventario",
        "agregar_productos_inventario",
        "visualizar_nivel_stock_inventario",
        "editar_inventario",
        "agregar_categoria_producto",
        "realizar_auditoria_inventario",
        "reportar_stock_danado",
        "historial_modificaciones_de_inventario",
        "gestionar_proveedores",
        "ver_proveedores",
        "ver_proveedor",
        "eliminar_proveedores",
        "gestionar_insumos",
        "control_de_desperdicios",
        "ver_produccion",
        "visualizar_datos_produccion",
        "configurar_objetivos_produccion",
        "registrar_lotes_produccion",
        "registrar_ventas",
        "modificar_ventas",
        "registrar_ventas_programadas",
        "control_de_comisiones",
        "configurar_precios_y_descuentos",
        "visualizar_historial_ventas",
        "registrar_pagos",
        "generar_facturas",
        "generar_metas_ventas",
        "aprobar_devoluciones",
        "crear_cliente",
        "editar_cliente",
        "ver_cliente",
        "visualizar_historial_cliente",
        "configurar_nivel_cliente",
        "ver_rutas",
        "asignar_entregas",
        "marcar_entrega_como_finalizada",
        "ver_estado_entrega",
        "ver_estado_chofer",
        "registrar_incidencia_en_ruta",
        "generar_reporte_de_ruta",
        "generar_reporte_inventario",
        "generar_reporte_ventas",
        "visualizar_reportes",
        "exportar_reportes",
        "ver_perfil",
        "editar_perfil",
        "configurar_perfil_usuario",
        "configurar_parametros_del_sistema",
        "editar_ajustes_de_la_interfaz",
        "configurar_permisos_avanzados",
        "realizar_copias_de_seguridad",
        "acceso_a_log_del_sistema",
        "autenticacion_dos_factores",
        "auditar_intentos_fallidos",
        "ver_dashboard",
        "ver_facturas",
        "ver_sucursales",
        "ver_sucursal",
        "buscar_sucursal",
        "actualizar_sucursal",
        "ver_pagos",
        "ver_cotizaciones",
        "ver_pedidos",
        "ver_ventas",
        "ver_clientes",
        "ver_productos",
        "ver_producto",
        "ver_productos_disponibles",
        "editar_producto",
        "crear_producto",
        "borrar_producto",
        "borrar_productos",
        "ver_insumos",
        "ver_insumo",
        "ver_insumo_disponibles",
        "editar_insumo",
        "crear_insumo",
        "borrar_insumo",
        "borrar_insumos",
        "ver_producto_retornable",
        "crear_producto_retornable",
        "editar_producto_retornable",
        "ver_productos_retornables",
        "borrar_producto_retornable",
        "ver_categorias",
        "ver_tipo_insumo",
        "ver_entregas_realizadas",
        "ver_camiones",
        "ver_agenda_carga",
        "ver_estadisticas",
        "ver_admin",
        "ver_entregas",
        "ver_ventas_chofer",
        "ver_empresas",
        "ver_empresa",
        "ver_empresa_nombre",
        "ver_empresa_usuario",
        "editar_empresa",
        "crear_categoria",
        "editar_categoria",
        "borrar_categoria",
        "crear_tipo_insumo",
        "editar_tipo_insumo",
        "borrar_tipo_insumo",
      ],

      operario: [
        "iniciar_sesion",
        "ver_inventario",
        "agregar_productos_inventario",
        "visualizar_nivel_stock_inventario",
        "reportar_stock_danado",
        "control_de_desperdicios",
        "ver_produccion",
        "visualizar_datos_produccion",
        "registrar_lotes_produccion",
        "ver_perfil",
        "editar_perfil",
        "configurar_perfil_usuario",
        "configurar_parametros_del_sistema",
        "autenticacion_dos_factores",
        "ver_productos",
        "ver_insumos",
        "ver_categorias",
      ],
      chofer: [
        "iniciar_sesion",
        "ver_inventario_camion",
        "reportar_stock_danado",
        "registrar_ventas",
        "modificar_ventas",
        "registrar_pagos",
        "ver_rutas",
        "marcar_entrega_como_finalizada",
        "registrar_incidencia_en_ruta",
        "ver_perfil",
        "editar_perfil",
        "configurar_perfil_usuario",
        "autenticacion_dos_factores",
        "ver_clientes",
        "ver_camiones",
        "ver_agenda_carga",
        "ver_entregas",
        "ver_entregas_asignadas",
        "ver_ventas_chofer",
      ],
    }; */

    /* for (const [rolNombre, permisos] of Object.entries(permisosPorRol)) {
      const rol = rolesCreados.find((r) => r.nombre === rolNombre);
      const permisosIds = permisosCreados
        .filter((p) => permisos.includes(p.nombre))
        .map((p) => p.id);

      const relaciones = permisosIds.map((permisoId) => ({
        rolId: rol.id,
        permisoId,
      }));

      await RolesPermisos.bulkCreate(relaciones);
    } */
    /* 
    console.log("Permisos asignados a roles"); */

    // Crear empresa Aguas Valentino
    const empresaData = {
      nombre: "Aguas Valentino",
      direccion: "Av. Principal 1234, Ciudad Central",
      telefono: "+56 9 1234 5678",
      email: "contacto@aguasvalentino.com",
      rut_empresa: "12345678-9",
    };
    console.log("✅ Empresa 'Aguas Valentino' creada exitosamente.");
    const empresaCreada = await Empresa.create(empresaData);

    const sucursalData = {
      nombre: "Sucursal Central",
      direccion: "Av. Secundaria 5678, Ciudad Central",
      telefono: "+56 9 8765 4321",
      id_empresa: empresaCreada.id_empresa, // Relación con la empresa creada
    };

    const sucursalCreada = await Sucursal.create(sucursalData);
    console.log("✅ Sucursal 'Sucursal Central' creada exitosamente.");
    // Crear usuarios
    const usuariosData = [
      {
        rut: "12.345.678-9",
        nombre: "Test1",
        apellido: "Test1",
        email: "test1.test@example.com",
        password:
          "$2a$12$hpZ1Dq.mAvJLKJhZyQq6Ie2FSYsWzx46WJcJFpBXWG/Tvxx2HPibG", // Asegúrate de encriptar las contraseñas en producción
        rolId: rolesCreados.find((r) => r.nombre === "administrador").id,
        id_empresa: empresaCreada.dataValues.id_empresa,
        id_sucursal: sucursalCreada.dataValues.id_sucursal,
      },
      /*       {
        rut: "98765432-1",
        nombre: "Test2",
        apellido: "Test2",
        email: "Test2.test@example.com",
        password:
          "$2a$12$hpZ1Dq.mAvJLKJhZyQq6Ie2FSYsWzx46WJcJFpBXWG/Tvxx2HPibG", 
        rolId: rolesCreados.find((r) => r.nombre === "vendedor").id,
        id_empresa: empresaCreada.dataValues.id_empresa,
        id_sucursal: sucursalCreada.dataValues.id_sucursal
      }, */
    ];

    await Usuarios.bulkCreate(usuariosData);
    console.log("✅ Usuarios creados");
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
        nombre_estado: "Eliminado",
        descripcion: "Producto Eliminado.",
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
    console.log("✅ Estados productos creados");

    // Crear Tipos de productos
    const tipos = [
      {
        nombre_tipo: "Insumos Ablandadores",
        descripcion: "Materiales relacionados con procesos de ablandamiento",
      },
      {
        nombre_tipo: "Insumos Inventario",
        descripcion: "Elementos necesarios para gestión de inventario",
      },
      {
        nombre_tipo: "Insumos Aseo",
        descripcion: "Materiales destinados a la limpieza y aseo",
      },
      {
        nombre_tipo: "Insumos Oficina",
        descripcion: "Artículos utilizados en oficinas",
      },
    ];

    await TipoInsumo.bulkCreate(tipos);
    console.log("✅ Tipos de insumos creados");

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
    console.log("✅ Categoria productos creadas");
    /******************************/
    //       Módulo VENTAS        *
    /******************************/

    // Estados de ventas
    const estadosVentas = [
      // Estados comunes
      {
        nombre_estado: "Pendiente",
        descripcion:
          "Estado inicial al registrar un pedido o venta, pendiente de procesamiento.",
        tipo_transaccion: ["venta", "pedido"],
        es_inicial: true,
      },
      {
        nombre_estado: "Pendiente de Pago",
        descripcion: "La venta o pedido está pendiente del pago del cliente.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        nombre_estado: "Pagada",
        descripcion: "El pago ha sido realizado exitosamente.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        nombre_estado: "Pendiente de Confirmación",
        descripcion:
          "Pedido asignado al chofer y pendiente de confirmación por su parte.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },
      {
        nombre_estado: "Confirmado",
        descripcion: "Pedido aceptado y confirmado por el chofer.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },
      {
        nombre_estado: "Rechazado",
        descripcion: "Pedido rechazado por el chofer asignado.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },
      {
        nombre_estado: "En Preparación",
        descripcion:
          "La venta o pedido está siendo preparado para despacho o retiro.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        nombre_estado: "En Entrega",
        descripcion: "La venta o pedido está en ruta hacia el cliente.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },
      {
        nombre_estado: "Completada",
        descripcion: "La venta o pedido fue entregado exitosamente al cliente.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        nombre_estado: "Cancelada",
        descripcion: "La transacción fue cancelada antes de completarse.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        nombre_estado: "Reembolsada",
        descripcion: "El pago asociado fue devuelto al cliente.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        nombre_estado: "Rechazada",
        descripcion:
          "La transacción fue rechazada por problemas con el pago o autorización.",
        tipo_transaccion: "venta",
        es_inicial: false,
      },
      {
        nombre_estado: "Completada y Entregada",
        descripcion: "El pedido ha sido entregado correctamente y cerrado.",
        tipo_transaccion: "pedido",
        es_inicial: false,
      },
    ];
    await EstadoVenta.bulkCreate(estadosVentas);
    console.log("✅ Estados de Transacción creados exitosamente.");

    // Estado Pago
    const estadosPago = [
      { nombre: "Pendiente", descripcion: "El pago aún no se ha completado." },
      {
        nombre: "Pagado",
        descripcion: "El pago ha sido completado exitosamente.",
      },
      {
        nombre: "Emitido",
        descripcion: "Se ha emitido un pago.",
      },
      {
        nombre: "Anulado",
        descripcion: "Se ha anulado un pago.",
      },
      {
        nombre: "Rechazado",
        descripcion: "El pago fue rechazado por el método.",
      },
    ];
    await EstadoPago.bulkCreate(estadosPago);
    console.log("✅ Estado Pago creado exitosamente.");
    // Método Pago
    const metodosPago = [
      { nombre: "Efectivo", descripcion: "Pago en efectivo." },
      {
        nombre: "Tarjeta crédito",
        descripcion: "Pago con tarjeta de crédito.",
      },
      { nombre: "Tarjeta débito", descripcion: "Pago con tarjeta de débito." },
      { nombre: "Transferencia", descripcion: "Transferencia bancaria." },
    ];
    await MetodoPago.bulkCreate(metodosPago);
    console.log("✅ Métodos Pago creado exitosamente.");
    /***********************************************************************************/
    console.log("✅ Base de datos poblada con éxito.");
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
  } finally {
    await sequelize.close();
    console.log("✅ Conexión cerrada.");
  }
}

populateDatabase();

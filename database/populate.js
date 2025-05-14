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
import Producto from "../inventario/domain/models/Producto.js";
import Inventario from "../inventario/domain/models/Inventario.js";
import Insumo from "../inventario/domain/models/Insumo.js";

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
    // Crear empresa Aguas Valentino
    const empresaData = {
      nombre: "Aguas Valentino",
      direccion: "Av. Principal 1234, Ciudad Central",
      telefono: "+56 9 1234 5678",
      email: "aguasvalentino@aguasvalentino.com",
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
        nombre: "administrador",
        apellido: "-",
        email: "aguasvalentino@aguasvalentino.com",
        password:
          "$2a$12$hpZ1Dq.mAvJLKJhZyQq6Ie2FSYsWzx46WJcJFpBXWG/Tvxx2HPibG",
        rolId: rolesCreados.find((r) => r.nombre === "administrador").id,
        id_empresa: empresaCreada.dataValues.id_empresa,
        id_sucursal: sucursalCreada.dataValues.id_sucursal,
      },
      {
        rut: "99.999.999-9",
        nombre: "Chofer 1",
        apellido: "-",
        email: "chofer1@aguasvalentino.com",
        password:
          "$2a$12$hpZ1Dq.mAvJLKJhZyQq6Ie2FSYsWzx46WJcJFpBXWG/Tvxx2HPibG",
        rolId: rolesCreados.find((r) => r.nombre === "chofer").id,
        id_empresa: empresaCreada.dataValues.id_empresa,
        id_sucursal: sucursalCreada.dataValues.id_sucursal,
      },
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
      {
        nombre_categoria: "Bebidas y Aguas",
        descripcion:
          "Productos líquidos envasados como aguas, jugos y bebidas.",
      },
    ];

    await CategoriaProducto.bulkCreate(categorias);
    console.log("✅ Categoria productos creadas");

    /**********************
     *
     * Productos e Insumos
     *
     *********************/

    const estadoDisponible = await EstadoProducto.findOne({
      where: { nombre_estado: "Disponible - Bodega" },
    });
    const categoriaBotellones = await CategoriaProducto.findOne({
      where: { nombre_categoria: "Botellones" },
    });
    const categoriaHielo = await CategoriaProducto.findOne({
      where: { nombre_categoria: "Hielo" },
    });
    const categoriaBebidas = await CategoriaProducto.findOne({
      where: { nombre_categoria: "Bebidas y Aguas" },
    });

    // Productos a crear
    const productosVenta = [
      {
        nombre_producto: "Botellón 12L",
        cantidad: 250,
        categoria: categoriaBotellones,
      },
      {
        nombre_producto: "Botellón 20L",
        cantidad: 250,
        categoria: categoriaBotellones,
        precio: 2000,
        es_retornable: true,
      },
      {
        nombre_producto: "Hielo Cubos 1kg",
        cantidad: 1000,
        categoria: categoriaHielo,
        descripcion: "Unidad de medida: kg",
      },
      {
        nombre_producto: "Hielo Cubos 2kg",
        cantidad: 1000,
        categoria: categoriaHielo,
        descripcion: "Unidad de medida: kg",
      },
      {
        nombre_producto: "Hielo Cubos 25kg",
        cantidad: 100,
        categoria: categoriaHielo,
        descripcion: "Unidad de medida: kg",
      },
      {
        nombre_producto: "Hielo Cubos Granel",
        cantidad: 500,
        categoria: categoriaHielo,
        descripcion: "Unidad de medida: granel",
      },

      // Hielo Frappe
      {
        nombre_producto: "Hielo Frappe 1kg",
        cantidad: 1000,
        categoria: categoriaHielo,
        descripcion: "Unidad de medida: kg",
      },
      {
        nombre_producto: "Hielo Frappe 2kg",
        cantidad: 1000,
        categoria: categoriaHielo,
        descripcion: "Unidad de medida: kg",
      },
      {
        nombre_producto: "Hielo Frappe 25kg",
        cantidad: 100,
        categoria: categoriaHielo,
        descripcion: "Unidad de medida: kg",
      },
      {
        nombre_producto: "Hielo Frappe Granel",
        cantidad: 500,
        categoria: categoriaHielo,
        descripcion: "Unidad de medida: granel",
      },
      {
        nombre_producto: "Agua sin gas 500cc",
        cantidad: 96,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 500cc",
      },
      {
        nombre_producto: "Agua sin gas 1.6",
        cantidad: 3,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 1.6L",
      },
      {
        nombre_producto: "Agua con gas 1.6",
        cantidad: 3,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 1.6L",
      },
      {
        nombre_producto: "Agua sabor pera 1.6",
        cantidad: 1,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 1.6L",
      },
      {
        nombre_producto: "Agua sabor manzana 1.6",
        cantidad: 1,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 1.6L",
      },
      {
        nombre_producto: "Bebida coca cola 1.5",
        cantidad: 2,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 1.5L",
      },
      {
        nombre_producto: "Jugos duraznos 1.5",
        cantidad: 1,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 1.5L",
      },
      {
        nombre_producto: "Jugos piña 1.5",
        cantidad: 1,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 1.5L",
      },
      {
        nombre_producto: "Jugos manzana 1.5",
        cantidad: 1,
        categoria: categoriaBebidas,
        descripcion: "Unidad de medida: 1.5L",
      },
    ];

    for (const p of productosVenta) {
      const producto = await Producto.create({
        nombre_producto: p.nombre_producto,
        tipo: "producto",
        id_categoria: p.categoria?.id_categoria,
        id_estado_producto: estadoDisponible.id_estado_producto,
        es_para_venta: true,
        descripcion: p.descripcion || null,
      });

      await Inventario.create({
        id_producto: producto.id_producto,
        cantidad: p.cantidad,
      });
    }
    console.log("✅ Productos de venta registrados con inventario");

    const tiposInsumo = await TipoInsumo.findAll();
    const mapTipo = new Map(
      tiposInsumo.map((t) => [t.nombre_tipo, t.id_tipo_insumo])
    );

    const insumosData = [
      // Ablandadores
      {
        nombre: "Sal",
        cantidad: 5,
        tipo: "Insumos Ablandadores",
        unidad: "sacos",
      },

      // Inventario
      {
        nombre: "Botellones",
        cantidad: 100,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Tapas",
        cantidad: 5000,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Bolsas de hielo chica",
        cantidad: 6000,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Bolsas de hielo grande",
        cantidad: 1000,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Dispensadores USB",
        cantidad: 80,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Dispensadores mesa",
        cantidad: 10,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Etiquetas 20",
        cantidad: 5000,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Etiquetas 5",
        cantidad: 10000,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      }, // sumadas 5000 + 5000
      {
        nombre: "Etiquetas dispensadores",
        cantidad: 5000,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Botellas 5 litros",
        cantidad: 500,
        tipo: "Insumos Inventario",
        unidad: "unidad",
      },
      {
        nombre: "Amonio",
        cantidad: 5,
        tipo: "Insumos Inventario",
        unidad: "litros",
      },
      {
        nombre: "Desengrasante",
        cantidad: 5,
        tipo: "Insumos Inventario",
        unidad: "litros",
      },

      // Aseo
      {
        nombre: "Toalla papel",
        cantidad: 4,
        tipo: "Insumos Aseo",
        unidad: "rollos",
      },
      {
        nombre: "Papel higiénico",
        cantidad: 4,
        tipo: "Insumos Aseo",
        unidad: "rollos",
      },
      {
        nombre: "Guantes nitrilo",
        cantidad: 2,
        tipo: "Insumos Aseo",
        unidad: "caja",
      },
      {
        nombre: "Virutilla amarilla",
        cantidad: 2,
        tipo: "Insumos Aseo",
        unidad: "unidad",
      },
      {
        nombre: "Esponja",
        cantidad: 2,
        tipo: "Insumos Aseo",
        unidad: "unidad",
      },
      {
        nombre: "Cloro gel",
        cantidad: 1,
        tipo: "Insumos Aseo",
        unidad: "litro",
      },
      {
        nombre: "Limpia pisos",
        cantidad: 1,
        tipo: "Insumos Aseo",
        unidad: "litro",
      },
      {
        nombre: "Desodorante ambiental",
        cantidad: 1,
        tipo: "Insumos Aseo",
        unidad: "unidad",
      },
      {
        nombre: "Lisofort",
        cantidad: 1,
        tipo: "Insumos Aseo",
        unidad: "litro",
      },
      { nombre: "Cofia", cantidad: 1, tipo: "Insumos Aseo", unidad: "paquete" },
      {
        nombre: "Mascarillas",
        cantidad: 1,
        tipo: "Insumos Aseo",
        unidad: "caja",
      },

      // Oficina
      {
        nombre: "Redma carta",
        cantidad: 1,
        tipo: "Insumos Oficina",
        unidad: "paquete",
      },
      {
        nombre: "Lapicero",
        cantidad: 5,
        tipo: "Insumos Oficina",
        unidad: "unidad",
      },
      {
        nombre: "Plumón pizarra negro",
        cantidad: 5,
        tipo: "Insumos Oficina",
        unidad: "unidad",
      },
    ];
    for (const i of insumosData) {
      const insumo = await Insumo.create({
        nombre_insumo: i.nombre,
        id_tipo_insumo: mapTipo.get(i.tipo),
        unidad_de_medida: i.unidad,
      });

      await Inventario.create({
        id_insumo: insumo.id_insumo,
        cantidad: i.cantidad,
      });
    }
    console.log("✅ Insumos registrados con inventario y unidad de medida");

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

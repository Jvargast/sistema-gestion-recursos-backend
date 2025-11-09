import ProductosRepository from "../infrastructure/repositories/ProductosRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import EstadoProductoService from "./EstadoProductoService.js";
import InventarioService from "./InventarioService.js";
import CategoriaProductoService from "./CategoriaProductoService.js";
import EstadoProductoRepository from "../infrastructure/repositories/EstadoProductoRepository.js";
import CategoriaProductoRepository from "../infrastructure/repositories/CategoriaProductoRepository.js";
import { Op } from "sequelize";
import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";
import InsumoRepository from "../infrastructure/repositories/InsumoRepository.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import sequelize from "../../database/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toBool = (v) => v === true || v === "true" || v === 1 || v === "1";
const toIntOrNull = (v) => (v === "" || v == null ? null : Number(v));

class ProductoService {
  async getProductoById(id) {
    const producto = await ProductosRepository.findById(id);
    if (!producto) throw new Error("Producto no encontrado.");

    return producto;
  }

  async getAllProductos(filters = {}, options) {
    const allowedFields = [
      "nombre_producto",
      "marca",
      "descripcion",
      "precio",
      "id_categoria",
      "id_estado_producto",
      "id_inventario",
      "id_sucursal",
    ];
    const where = createFilter(filters, allowedFields);

    if (options.estado) {
      where["$estadoProducto.nombre_estado$"] = options.estado;
    }

    if (options.search) {
      where[Op.or] = [
        {
          "$categoria.nombre_categoria$": { [Op.like]: `%${options.search}%` },
        },
        {
          "$estadoProducto.nombre_estado$": {
            [Op.like]: `%${options.search}%`,
          },
        },
        { marca: { [Op.like]: `%${options.search}%` } },
        { descripcion: { [Op.like]: `%${options.search}%` } },
        { nombre_producto: { [Op.like]: `%${options.search}%` } },
      ];
    }

    const inventarioInclude = {
      model: InventarioRepository.getModel(),
      as: "inventario",
      attributes: ["cantidad", "fecha_actualizacion", "id_sucursal"],
    };
    if (options.id_sucursal) {
      inventarioInclude.where = { id_sucursal: options.id_sucursal };
      inventarioInclude.required = false;
    }

    const include = [
      {
        model: CategoriaProductoRepository.getModel(),
        as: "categoria",
        attributes: ["nombre_categoria", "descripcion"],
      },
      {
        model: EstadoProductoRepository.getModel(),
        as: "estadoProducto",
        attributes: ["nombre_estado", "descripcion"],
      },
      inventarioInclude,
    ];

    const result = await paginate(ProductosRepository.getModel(), options, {
      where,
      include,
      order: [["id_producto", "ASC"]],
      subQuery: false,
    });
    return result;
  }

  async createProducto(data) {
    const { nombre_producto, precio, id_categoria, ...rest } = data;

    if (!nombre_producto)
      throw new Error("El campo 'nombre_producto' es obligatorio");

    if (!precio || isNaN(Number(precio)) || Number(precio) < 0) {
      throw new Error(
        "El campo 'precio' debe ser un número válido y mayor o igual a 0"
      );
    }

    if (!id_categoria)
      throw new Error("El campo 'id_categoria' es obligatorio");

    await CategoriaProductoService.getCategoriaById(id_categoria);

    const productoExistente = await ProductosRepository.findByNombre(
      nombre_producto
    );
    if (productoExistente)
      throw new Error("El producto ya se encuentra registrado");

    const producto = await ProductosRepository.create({
      nombre_producto,
      precio: Number(precio),
      id_categoria,
      id_estado_producto: 1,
      image_url: "https://via.placeholder.com/150",
      ...rest,
    });

    return await this.getProductoById(producto.id_producto);
  }

  async updateProducto(id, data, file) {
    console.log("DATA", data);

    const producto = await this.getProductoById(id);
    if (!producto) throw new Error("El producto no existe");

    let imageUrl = data.image_url || undefined;

    if (file) {
      if (producto.image_url && producto.image_url.startsWith("/images/")) {
        const oldImagePath = path.join(
          __dirname,
          "../../public",
          producto.image_url
        );
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      imageUrl = `/images/${file.filename}`;
    }

    const payload = {
      nombre_producto: data.nombre_producto,
      marca: data.marca,
      codigo_barra: data.codigo_barra,
      descripcion: data.descripcion,

      precio: data.precio !== undefined ? Number(data.precio) : undefined,
      id_categoria: data.id_categoria ? Number(data.id_categoria) : undefined,
      id_estado_producto: data.id_estado_producto
        ? Number(data.id_estado_producto)
        : undefined,

      es_para_venta: toBool(data.es_para_venta),
      activo: toBool(data.activo),
      es_retornable: toBool(data.es_retornable),

      id_insumo_retorno: toBool(data.es_retornable)
        ? toIntOrNull(data.id_insumo_retorno)
        : null,

      ...(imageUrl && { image_url: imageUrl }),
    };

    const [rows] = await ProductosRepository.update(id, payload); // ✅ objeto PLANO
    if (rows === 0) return producto;
    return this.getProductoById(id);
  }

  async deleteProducto(id) {
    await InventarioService.deleteInventario(id);
    await ProductosRepository.delete(id);
    return true;
  }

  async cambiarEstadoProducto(idProducto, nuevoEstado) {
    const updated = await ProductosRepository.updateEstadoProducto(
      idProducto,
      nuevoEstado
    );

    return {
      message: "Estado del producto actualizado con éxito",
      producto: updated,
    };
  }

  async obtenerProductosPorEstado(id) {
    return await ProductosRepository.findProductosByEstado(id);
  }

  async validarInventarioParaPedido(productos) {
    for (const { id_producto, cantidad } of productos) {
      const inventario = await InventarioService.getInventarioByProductoId(
        id_producto
      );
      if (inventario.cantidad < cantidad) {
        throw new Error(
          `Inventario insuficiente para el producto ID ${id_producto}. Disponible: ${inventario.cantidad}`
        );
      }
    }
    return true;
  }
  async deleteProductos(ids, id_usuario) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(
        "Debe proporcionar al menos un ID de transacción para eliminar."
      );
    }
    const productos = await ProductosRepository.findByIds(ids);
    if (productos.length !== ids.length) {
      const notFoundIds = ids.filter(
        (id) => !productos.some((producto) => producto.id_producto === id)
      );
      throw new Error(
        `Los siguientes productos no fueron encontradas: ${notFoundIds.join(
          ", "
        )}`
      );
    }
    const estadoEliminado = await EstadoProductoService.getEstadoByNombre(
      "Eliminado"
    );
    for (const producto of productos) {
      await ProductosRepository.update(producto.id_producto, {
        id_estado_producto: estadoEliminado.dataValues.id_estado_producto,
      });
    }
    return {
      message: `Se marcaron como eliminados ${ids.length} productos.`,
    };
  }

  async getAvailableProductos(filters = {}, options) {
    const allowedFields = [
      "nombre_producto",
      "marca",
      "descripcion",
      "precio",
      "id_categoria",
      "id_estado_producto",
    ];
    const where = createFilter(filters, allowedFields);
    if (options.estado) {
      where["$estadoProducto.nombre_estado$"] = options.estado;
    }

    if (options.categoria && options.categoria !== "all") {
      where["$categoria.nombre_categoria$"] = options.categoria;
    }

    if (options.search) {
      where[Op.or] = [
        {
          "$categoria.nombre_categoria$": { [Op.like]: `%${options.search}%` },
        },
        {
          "$estadoProducto.nombre_estado$": {
            [Op.like]: `%${options.search}%`,
          },
        },
        { marca: { [Op.like]: `%${options.search}%` } },
        { descripcion: { [Op.like]: `%${options.search}%` } },
        { nombre_producto: { [Op.like]: `%${options.search}%` } },
      ];
    }
    const include = [
      {
        model: CategoriaProductoRepository.getModel(),
        as: "categoria",
        attributes: ["nombre_categoria"],
      },
      {
        model: EstadoProductoRepository.getModel(),
        as: "estadoProducto",
        attributes: ["nombre_estado"],
      },
      {
        model: InventarioRepository.getModel(),
        as: "inventario",
        attributes: ["cantidad", "id_sucursal"],
        where: {
          cantidad: { [Op.gt]: 0 },
          ...(filters.id_sucursal && {
            id_sucursal: filters.id_sucursal,
          }),
        },
      },
    ];

    const result = await paginate(ProductosRepository.getModel(), options, {
      where,
      include,
      order: [["id_producto", "ASC"]],
    });
    return result;
  }

  /*   async getAvailableVendibles(filters = {}, options = {}) {
    const productosRaw = await this.getAvailableProductos(filters, {
      ...options,
      page: 1,
      limit: 9999,
    });

    const productosFormateados = Array.isArray(productosRaw?.data)
      ? productosRaw?.data?.map((p) => ({
          ...p,
          tipo: "producto",
        }))
      : [];

    const insumosVendibles = await InsumoRepository.getModel().findAll({
      where: {
        es_para_venta: true,
      },
      include: [
        {
          model: InventarioRepository.getModel(),
          as: "inventario",
          attributes: ["cantidad", "id_sucursal"],
          where: {
            cantidad: { [Op.gt]: 0 },
            ...(filters.id_sucursal && {
              id_sucursal: filters.id_sucursal,
            }),
          },
        },
      ],
      attributes: ["id_insumo", "nombre_insumo", "precio", "descripcion"],
      order: [["id_insumo", "ASC"]],
    });

    const insumosFormateados = Array.isArray(insumosVendibles)
      ? insumosVendibles.map((insumo) => {
          const inventarioItem = Array.isArray(insumo.inventario)
            ? insumo.inventario[0]
            : insumo.inventario;

          return {
            id_producto: `insumo_${insumo.id_insumo}`,
            nombre_producto: insumo.nombre_insumo,
            precio: insumo.precio,
            descripcion: insumo.descripcion,
            tipo: "insumo",
            inventario: insumo.inventario,
          };
        })
      : [];

    const combinado = [...productosFormateados, ...insumosFormateados];

    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    const paginated = combinado.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        page,
        totalItems: combinado.length,
        totalPages: Math.ceil(combinado.length / limit),
      },
    };
  } */

  async getAvailableProductosFull(filters = {}, options = {}) {
    const where = {};
    if (options.estado)
      where["$estadoProducto.nombre_estado$"] = options.estado;
    if (options.categoria && options.categoria !== "all") {
      where["$categoria.nombre_categoria$"] = options.categoria;
    }
    if (options.search) {
      const s = options.search;
      where[Op.or] = [
        { "$categoria.nombre_categoria$": { [Op.iLike]: `%${s}%` } },
        { "$estadoProducto.nombre_estado$": { [Op.iLike]: `%${s}%` } },
        { marca: { [Op.iLike]: `%${s}%` } },
        { descripcion: { [Op.iLike]: `%${s}%` } },
        { nombre_producto: { [Op.iLike]: `%${s}%` } },
      ];
    }

    const include = [
      {
        model: CategoriaProductoRepository.getModel(),
        as: "categoria",
        attributes: ["nombre_categoria"],
        required: false,
      },
      {
        model: EstadoProductoRepository.getModel(),
        as: "estadoProducto",
        attributes: ["nombre_estado"],
        required: false,
      },
      {
        model: InventarioRepository.getModel(),
        as: "inventario",
        attributes: ["cantidad", "id_sucursal"],
        required: true,
        where: {
          cantidad: { [Op.gt]: 0 },
          ...(filters.id_sucursal && { id_sucursal: filters.id_sucursal }),
        },
      },
    ];

    const rows = await ProductosRepository.getModel().findAll({
      where,
      include,
      attributes: ["id_producto", "nombre_producto", "precio", "descripcion"],
      order: [["id_producto", "ASC"]],
      subQuery: false,
      raw: true,
      nest: true,
    });

    return rows.map((p) => ({
      id_producto: p.id_producto,
      nombre_producto: p.nombre_producto,
      precio: p.precio,
      descripcion: p.descripcion,
      tipo: "producto",
      inventario: Array.isArray(p.inventario) ? p.inventario : [p.inventario],
    }));
  }

  async getInsumosVendiblesFull(filters = {}, options = {}) {
    const whereInsumo = { es_para_venta: true };
    const include = [
      {
        model: InventarioRepository.getModel(),
        as: "inventario",
        attributes: ["cantidad", "id_sucursal"],
        required: true, // inner join
        where: {
          cantidad: { [Op.gt]: 0 },
          ...(filters.id_sucursal && { id_sucursal: filters.id_sucursal }),
        },
      },
    ];

    if (options.search) {
      whereInsumo[Op.or] = [
        { nombre_insumo: { [Op.iLike]: `%${options.search}%` } },
        { descripcion: { [Op.iLike]: `%${options.search}%` } },
      ];
    }

    const insumos = await InsumoRepository.getModel().findAll({
      where: whereInsumo,
      include,
      attributes: ["id_insumo", "nombre_insumo", "precio", "descripcion"],
      order: [["id_insumo", "ASC"]],
      subQuery: false,
      raw: true,
      nest: true,
    });

    return insumos.map((i) => ({
      id_producto: `insumo_${i.id_insumo}`,
      nombre_producto: i.nombre_insumo,
      precio: i.precio,
      descripcion: i.descripcion,
      tipo: "insumo",
      inventario: Array.isArray(i.inventario) ? i.inventario : [i.inventario],
    }));
  }

  async getAvailableVendibles(filters = {}, options = {}) {
    const [productos, insumos] = await Promise.all([
      this.getAvailableProductosFull(filters, options),
      this.getInsumosVendiblesFull(filters, options),
    ]);

    const combinado = [...productos, ...insumos];

    return {
      data: combinado,
      pagination: {
        page: 1,
        totalItems: combinado.length,
        totalPages: 1,
      },
    };
  }

  async getAvailableVendiblesPaged(filters = {}, options = {}) {
    const id_sucursal = Number(options.id_sucursal ?? filters.id_sucursal ?? 0);
    const search = options.search ?? "";
    const limit = Number(options.limit ?? 24);
    const offset = Number(options.offset ?? 0);
    const orderBy = options.orderBy === "precio" ? "precio" : "nombre";
    const orderDir = options.orderDir === "DESC" ? "DESC" : "ASC";
    const categoria = options.categoria || null;

    if (!id_sucursal) throw new Error("id_sucursal requerido");

    const q = search ? `%${search}%` : null;
    const hasCategoria = !!categoria;

    const totalRows = await sequelize.query(
      `
    SELECT
      (
        SELECT COUNT(*)
        FROM "Producto" p
        JOIN "Inventario" inv ON inv.id_producto = p.id_producto
        ${
          hasCategoria
            ? `JOIN "CategoriaProducto" c ON c.id_categoria = p.id_categoria`
            : ""
        }
        WHERE inv.cantidad > 0
          AND inv.id_sucursal = :id_sucursal
          ${hasCategoria ? `AND c.nombre_categoria = :categoria` : ""}
          AND (:q IS NULL OR (
            p.nombre_producto ILIKE :q OR p.descripcion ILIKE :q OR p.marca ILIKE :q
          ))
      )
      ${
        hasCategoria
          ? `
        -- si hay categoría, no contamos insumos
        + 0
      `
          : `
        +
        (
          SELECT COUNT(*)
          FROM "Insumo" i
          JOIN "Inventario" inv2 ON inv2.id_insumo = i.id_insumo
          WHERE inv2.cantidad > 0
            AND inv2.id_sucursal = :id_sucursal
            AND i.es_para_venta = true
            AND (:q IS NULL OR (
              i.nombre_insumo ILIKE :q OR i.descripcion ILIKE :q
            ))
        )
      `
      }
      AS total;
    `,
      {
        replacements: { id_sucursal, q, categoria },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const total = Number(totalRows?.[0]?.total ?? 0);

    const rows = await sequelize.query(
      `
WITH productos AS (
  SELECT
    p.id_producto::text             AS id,
    p.id_producto                   AS id_producto_real,
    p.nombre_producto               AS nombre,
    p.precio                        AS precio,
    p.descripcion                   AS descripcion,
    'producto'::text                AS tipo,
    json_build_array(
      json_build_object(
        'cantidad', inv.cantidad,
        'id_sucursal', inv.id_sucursal
      )
    )::json                         AS inventario
  FROM "Producto" p
  JOIN "Inventario" inv ON inv.id_producto = p.id_producto
  ${
    hasCategoria
      ? `JOIN "CategoriaProducto" c ON c.id_categoria = p.id_categoria`
      : ``
  }
  WHERE inv.cantidad > 0
    AND inv.id_sucursal = :id_sucursal
    ${hasCategoria ? `AND c.nombre_categoria = :categoria` : ``}
    AND (COALESCE(:q, '') = '' OR (
      p.nombre_producto ILIKE :q OR p.descripcion ILIKE :q OR p.marca ILIKE :q
    ))
)
, insumos AS (
  ${
    hasCategoria
      ? `
        -- cuando hay categoría, devolvemos CTE vacío pero con MISMAS columnas
        SELECT
          NULL::text    AS id,
          NULL::int     AS id_producto_real,
          NULL::text    AS nombre,
          NULL::numeric AS precio,
          NULL::text    AS descripcion,
          NULL::text    AS tipo,
          NULL::json    AS inventario
        WHERE FALSE
      `
      : `
        SELECT
          ('insumo_' || i.id_insumo)::text AS id,
          i.id_insumo                       AS id_producto_real,
          i.nombre_insumo                   AS nombre,
          i.precio                          AS precio,
          i.descripcion                     AS descripcion,
          'insumo'::text                    AS tipo,
          json_build_array(
            json_build_object(
              'cantidad', inv2.cantidad,
              'id_sucursal', inv2.id_sucursal
            )
          )::json                           AS inventario
        FROM "Insumo" i
        JOIN "Inventario" inv2 ON inv2.id_insumo = i.id_insumo
        WHERE inv2.cantidad > 0
          AND inv2.id_sucursal = :id_sucursal
          AND i.es_para_venta = true
          AND (COALESCE(:q, '') = '' OR (
            i.nombre_insumo ILIKE :q OR i.descripcion ILIKE :q
          ))
      `
  }
)
SELECT * FROM (
  SELECT * FROM productos
  UNION ALL
  SELECT * FROM insumos
) t
ORDER BY ${orderBy} ${orderDir}, id ASC
LIMIT :limit OFFSET :offset;
`,
      {
        replacements: {
          id_sucursal,
          q,
          limit,
          offset,
          categoria,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const data = rows.map((r) => ({
      id_producto:
        r.tipo === "insumo"
          ? `insumo_${r.id_producto_real}`
          : r.id_producto_real,
      nombre_producto: r.nombre,
      precio: r.precio,
      descripcion: r.descripcion,
      tipo: r.tipo,
      inventario: r.inventario,
    }));

    return {
      data,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        totalItems: total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}

export default new ProductoService();

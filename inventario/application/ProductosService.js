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

    // ⬇️ aplanar y castear
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

  async getAvailableVendibles(filters = {}, options = {}) {
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
  }
}

export default new ProductoService();

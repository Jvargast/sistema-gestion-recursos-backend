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

class ProductoService {
  async getProductoById(id) {
    const producto = await ProductosRepository.findById(id);
    if (!producto) throw new Error("Producto no encontrado.");

    // Incluir información de inventario
    const inventario = await InventarioService.getInventarioByProductoId(id);
    producto.dataValues.inventario = inventario;

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
        { marca: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
        { descripcion: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
        { nombre_producto: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
      ];
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
      {
        model: InventarioRepository.getModel(),
        as: "inventario",
        attributes: ["cantidad", "fecha_actualizacion"], // Campos relevantes del inventario
      },
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
    const { cantidad_inicial, ...productoData } = data;

    // Validar datos obligatorios
    if (!productoData.nombre_producto) {
      throw new Error("El campo 'nombre_producto' es obligatorio");
    }
    if (
      !productoData.precio ||
      isNaN(Number(productoData.precio)) ||
      Number(productoData.precio) < 0
    ) {
      throw new Error(
        "El campo 'precio' debe ser un número válido y mayor o igual a 0"
      );
    }
    if (!productoData.id_categoria) {
      throw new Error("El campo 'id_categoria' es obligatorio");
    }

    // Validar relaciones
    await CategoriaProductoService.getCategoriaById(productoData.id_categoria);

    const productoExistente = await ProductosRepository.findByNombre(
      productoData.nombre_producto
    );

    if (productoExistente) {
      throw new Error("El producto ya se encuentra registrado");
    }

    // Convertir precio a número
    productoData.precio = Number(productoData.precio);

    // Crear el producto
    const producto = await ProductosRepository.create({
      ...productoData,
      id_estado_producto: 1,
      image_url: "https://via.placeholder.com/150",
    });

    // Crear el inventario inicial para el producto
    if (cantidad_inicial !== undefined && cantidad_inicial >= 0) {
      await InventarioRepository.create({
        id_producto: producto.id_producto,
        cantidad: Number(cantidad_inicial),
        fecha_actualizacion: new Date(),
      });
    }
    return await this.getProductoById(producto.id_producto);
  }

  async updateProducto(id, data) {
    const { stock, codigo_barra, ...productoData } = data;

    const producto = await this.getProductoById(id);
    if (!producto) {
      throw new Error("El producto no existe");
    }

    const productoConCodigo = await ProductosRepository.findByCodigo(
      codigo_barra
    );

    if (
      productoConCodigo &&
      producto.codigo_barra !== productoConCodigo.codigo_barra
    ) {
      throw new Error(
        `Ya existe un producto con el código de barras: ${codigo_barra}`
      );
    }

    const updatedRows = await ProductosRepository.update(id, {
      ...productoData,
      codigo_barra,
    });

    if (!updatedRows || updatedRows[0] === 0) {
      throw new Error(
        "No se pudo actualizar el producto. Verifique los datos."
      );
    }

    if (stock) {
      await InventarioRepository.update(producto.id_producto, {
        cantidad: stock,
      });
    }

    return await this.getProductoById(id);
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
    // Filtro adicional para estado no "Eliminado"
    if (options.estado) {
      where["$estadoProducto.nombre_estado$"] = options.estado;
    }

    // Filtro de categoría (ignorar si es "all" o no está definido)
    if (options.categoria && options.categoria !== "all") {
      where["$categoria.nombre_categoria$"] = options.categoria;
    }

    if (options.search) {
      where[Op.or] = [
        {
          "$categoria.nombre_categoria$": { [Op.like]: `%${options.search}%` },
        }, // Buscar en categoria.nombre
        {
          "$estadoProducto.nombre_estado$": {
            [Op.like]: `%${options.search}%`,
          },
        }, // Buscar en estado.nombre_estado
        { marca: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
        { descripcion: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
        { nombre_producto: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
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
        attributes: ["cantidad"], // Campos relevantes del inventario
        where: {
          cantidad: { [Op.gt]: 50 },
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
    // 1. Obtener productos
    const productosRaw = await this.getAvailableProductos(filters, {
      ...options,
      page: 1,
      limit: 9999, // Obtener todos para mezclar
    });

    const productosFormateados = Array.isArray(productosRaw?.data)
      ? productosRaw?.data?.map((p) => ({
          ...p,
          tipo: "producto",
        }))
      : [];

    // 2. Obtener insumos vendibles
    const insumosVendibles = await InsumoRepository.getModel().findAll({
      where: {
        es_para_venta: true,
      },
      include: [
        {
          model: InventarioRepository.getModel(),
          as: "inventario",
          attributes: ["cantidad"],
          where: { cantidad: { [Op.gt]: 0 } },
        },
      ],
      attributes: ["id_insumo", "nombre_insumo", "precio", "descripcion"],
      order: [["id_insumo", "ASC"]],
    });

    const insumosFormateados = Array.isArray(insumosVendibles)
      ? insumosVendibles.map((insumo) => ({
          id_producto: `insumo_${insumo.id_insumo}`,
          nombre_producto: insumo.nombre_insumo,
          precio: insumo.precio,
          descripcion: insumo.descripcion,
          tipo: "insumo",
          inventario: {
            cantidad: insumo.inventario?.cantidad || 0, 
          },
        }))
      : [];

    // 🔀 Unificar productos e insumos
    const combinado = [...productosFormateados, ...insumosFormateados];

    // 📦 Paginar manualmente
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

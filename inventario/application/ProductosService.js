import ProductosRepository from "../infrastructure/repositories/ProductosRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import TipoProductoService from "./TipoProductoService.js";
import EstadoProductoService from "./EstadoProductoService.js";
import InventarioService from "./InventarioService.js";
import CategoriaProductoService from "./CategoriaProductoService.js";
import TransicionEstadoProductoService from "./TransicionEstadoProductoService.js";
import EstadoProductoRepository from "../infrastructure/repositories/EstadoProductoRepository.js";
import CategoriaProductoRepository from "../infrastructure/repositories/CategoriaProductoRepository.js";
import TipoProductoRepository from "../infrastructure/repositories/TipoProductoRepository.js";
import { Op } from "sequelize";
import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";

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
      "id_tipo_producto",
      "id_estado_producto",
    ];
    const where = createFilter(filters, allowedFields);
    // Filtro adicional para tipo_producto (Insumo)
    if (options.tipo_producto) {
      /* where[Op.eq] = [
        { "$tipo.nombre$": { [Op.eq]: `%${options.tipo_producto}%` } },
      ]; */
      where["$tipo.nombre$"] = options.tipo_producto;// Buscar en tipo.nombre
    }

    if (options.search) {
      where[Op.or] = [
        {
          "$categoria.nombre_categoria$": { [Op.like]: `%${options.search}%` },
        }, // Buscar en categoria.nombre
        { "$tipo.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en tipo.nombre
        { "$estado.nombre_estado$": { [Op.like]: `%${options.search}%` } }, // Buscar en estado.nombre_estado
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
        model: TipoProductoRepository.getModel(),
        as: "tipo",
        attributes: ["nombre", "descripcion"],
      },
      {
        model: EstadoProductoRepository.getModel(),
        as: "estado",
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
      subQuery: false
    });
    return result;
  }

  async createProducto(data) {
    const { cantidad_inicial, ...productoData } = data;

    // Validar relaciones
    await CategoriaProductoService.getCategoriaById(productoData.id_categoria);
    await TipoProductoService.getTipoById(productoData.id_tipo_producto);
    await EstadoProductoService.getEstadoById(productoData.id_estado_producto);

    // Crear el producto
    const producto = await ProductosRepository.create(productoData);

    // Crear el inventario inicial para el producto
    if (cantidad_inicial !== undefined && cantidad_inicial >= 0) {
      await InventarioRepository.create({
        id_producto: producto.id_producto,
        cantidad: cantidad_inicial,
        fecha_actualizacion: new Date(),
      });
    }
    return await this.getProductoById(producto.id_producto);
  }

  async updateProducto(id, data) {
    const { id_estado_destino, ...productoData } = data;

    if (id_estado_destino) {
      const producto = await this.getProductoById(id);

      await TransicionEstadoProductoService.validarTransicion(
        producto.id_estado_producto,
        id_estado_destino
      );
    }
    return await ProductosRepository.update(id, productoData);
  }

  // Eliminar el producto
  async deleteProducto(id) {
    await InventarioService.deleteInventario(id);
    await ProductosRepository.delete(id);
    return true;
  }

  //Modificarla?
  async getProductosByTipo(tipo) {
    const tipoProducto = await TipoProductoService.getAllTipos();

    const tipoId = tipoProducto.find(
      (t) => t.nombre === tipo
    )?.id_tipo_producto;

    if (!tipoId) throw new Error("Tipo de producto no encontrado.");

    const productos = await ProductosRepository.findAll({
      where: { id_tipo_producto: tipoId },
    });

    for (const producto of productos) {
      const inventario = await InventarioService.getInventarioByProductoId(
        producto.id_producto
      );
      producto.dataValues.inventario = inventario;
    }

    return productos;
  }

  async cambiarEstadoProducto(idProducto, nuevoEstado) {
    // Actualizar el estado del producto
    const updated = await ProductosRepository.updateEstadoProducto(
      idProducto,
      nuevoEstado
    );

    return {
      message: "Estado del producto actualizado con éxito",
      producto: updated,
    };
  }

  // Cambiar el estado de varios productos a la vez.
  async cambiarEstadoMasivo(productos, estadoDestino) {
    for (const producto of productos) {
      await TransicionEstadoProductoService.validarTransicion(
        producto.id_estado_producto,
        estadoDestino
      );
      await ProductosRepository.updateEstadoProducto(
        producto.id_producto,
        estadoDestino
      );
    }
    return true;
  }

  // Buscar productos según un estado específico.
  async obtenerProductosPorEstado(id) {
    return await ProductosRepository.findProductosByEstado(id);
  }

  // Verificar si hay suficiente inventario para procesar un pedido antes de crear una transacción.
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
      "id_tipo_producto",
      "id_estado_producto",
    ];
    const where = createFilter(filters, allowedFields);
    // Filtro adicional para tipo_producto (Insumo)
    if (options.tipo_producto) {
      /* where[Op.eq] = [
        { "$tipo.nombre$": { [Op.eq]: `%${options.tipo_producto}%` } },
      ]; */
      where["$tipo.nombre$"] = { [Op.eq]: options.tipo_producto }; // Buscar en tipo.nombre
    }

    if (options.search) {
      where[Op.or] = [
        {
          "$categoria.nombre_categoria$": { [Op.like]: `%${options.search}%` },
        }, // Buscar en categoria.nombre
        { "$tipo.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en tipo.nombre
        { "$estado.nombre_estado$": { [Op.like]: `%${options.search}%` } }, // Buscar en estado.nombre_estado
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
        model: TipoProductoRepository.getModel(),
        as: "tipo",
        attributes: ["nombre"],
      },
      {
        model: EstadoProductoRepository.getModel(),
        as: "estado",
        attributes: ["nombre_estado"],
      },
      {
        model: InventarioRepository.getModel(),
        as: "inventario",
        attributes: ["cantidad"], // Campos relevantes del inventario
        where: {
          cantidad: {[Op.gt]:200}
        }
      },
    ];

    const result = await paginate(ProductosRepository.getModel(), options, {
      where,
      include,
      order: [["id_producto", "ASC"]],
    });
    return result;
  }
}

export default new ProductoService();

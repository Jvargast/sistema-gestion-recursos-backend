import ProductosRepository from "../infrastructure/repositories/ProductosRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import TipoProductoService from "./TipoProductoService.js";
import EstadoProductoService from "./EstadoProductoService.js";
import InventarioService from "./InventarioService.js";
import CategoriaProductoService from "./CategoriaProductoService.js";
import TransicionEstadoProductoService from "./TransicionEstadoProductoService.js";
import TransaccionService from "../../ventas/application/TransaccionService.js";

class ProductoService {
  async getProductoById(id) {
    const producto = await ProductosRepository.findById(id);
    if (!producto) throw new Error("Producto no encontrado.");

    // Incluir información de inventario
    const inventario = await InventarioService.getInventarioByProductoId(id);
    producto.dataValues.inventario = inventario;

    return producto;
  }

  async getAllProductos(filters = {}, options = {}) {
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

    return await paginate(ProductosRepository.getModel(), options, { where });
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
    const { id_estado_producto, ...productoData } = data;

    if (id_estado_producto) {
      const producto = await this.getProductoById(id);

      await TransicionEstadoProductoService.registrarTransicion({
        id_producto: id,
        id_estado_origen: producto.id_estado_producto,
        id_estado_destino: id_estado_producto,
        id_usuario: productoData.id_usuario || null, // Asegurar que se pase el usuario
        condicion: productoData.condicion || "Actualización desde el servicio",
        comentarios:
          productoData.comentarios || "Actualización desde el servicio",
      });
    }

    return await ProductosRepository.update(id, productoData);
  }

  async deleteProducto(id) {
    await InventarioService.deleteInventario(id);
    await ProductosRepository.delete(id);
    return true;
  }

  //Modificarla
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
    const producto = await ProductosRepository.findById(idProducto);

    await TransicionEstadoProductoService.validarTransicion(
      producto.id_estado_producto,
      nuevoEstado
    );

    return await ProductosRepository.updateEstadoProducto(
      idProducto,
      nuevoEstado
    );
  }

  // Un método más avanzado que integre lógica de transacciones al cambio de estado.
  async manejarCambioEstadoConTransacciones(
    idProducto,
    nuevoEstado,
    idTransaccion
  ) {
    const producto = await ProductosRepository.findById(idProducto);
    if (!producto) throw new Error("Producto no encontrado");

    await TransicionEstadoProductoService.validarTransicion(
      producto.id_estado_producto,
      nuevoEstado
    );

    if (idTransaccion) {
      const transaccion = await TransaccionService.getTransaccionById(
        idTransaccion
      );
      if (!transaccion) throw new Error("Transacción no encontrada");

      if (
        ["venta", "pedido"].includes(transaccion.transaccion.tipo_transaccion)
      ) {
        await InventarioService.ajustarInventarioPorTransaccion(idTransaccion);
      }
    }

    return await ProductosRepository.updateEstadoProducto(
      idProducto,
      nuevoEstado
    );
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
}

export default new ProductoService();

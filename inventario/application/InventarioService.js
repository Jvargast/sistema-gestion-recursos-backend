import SucursalRepository from "../../auth/infraestructure/repositories/SucursalRepository.js";
import { obtenerFechaActualChile } from "../../shared/utils/fechaUtils.js";
import InsumoRepository from "../infrastructure/repositories/InsumoRepository.js";
import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";
import LogInventarioRepository from "../infrastructure/repositories/LogInventarioRepository.js";
import ProductosRepository from "../infrastructure/repositories/ProductosRepository.js";
import ProductosService from "./ProductosService.js";

class InventarioService {
  async getInventarioByProductoId(id_producto, id_sucursal, opts = {}) {
    const inv = await InventarioRepository.findProductoEnSucursal(
      id_producto,
      id_sucursal,
      opts
    );
    if (!inv) throw new Error("Inventario no encontrado para esa sucursal.");
    return inv;
  }

  async getInventarioByInsumoId(id_insumo, id_sucursal, opts = {}) {
    const inv = await InventarioRepository.findInsumoEnSucursal(
      id_insumo,
      id_sucursal,
      opts
    );
    if (!inv) throw new Error("Inventario no encontrado para esa sucursal.");
    return inv;
  }

  async getAllInventarios() {
    return await InventarioRepository.findAll();
  }

  async addInventario(data) {
    const producto = await ProductosService.getProductoById(data.id_producto);
    if (!producto) throw new Error("Producto no encontrado.");
    return await InventarioRepository.create(data);
  }

  async verificarInventarioMinimo(id_producto, cantidadMinima) {
    const inventario = await this.getInventarioByProductoId(id_producto);

    if (inventario.cantidad < cantidadMinima) {
      console.warn(
        `El producto con ID ${id_producto} está por debajo del inventario mínimo.`
      );
    }

    return inventario.cantidad >= cantidadMinima;
  }

  async deleteInventario(id_producto) {
    const deleted = await InventarioRepository.delete(id_producto);
    if (deleted === 0) throw new Error("No se pudo eliminar el inventario.");
    return true;
  }

  // Actualizar el inventario
  async ajustarCantidadInventario(idProducto, cantidad, idUsuario) {
    const inventario = await InventarioRepository.findByProductoId(idProducto);
    if (!inventario) throw new Error("Inventario no encontrado.");

    const nuevaCantidad = inventario.cantidad + cantidad;
    if (nuevaCantidad < 0)
      throw new Error("La cantidad no puede ser negativa.");

    await InventarioRepository.update(idProducto, { cantidad: nuevaCantidad });

    if (idUsuario) {
      await LogInventarioRepository.createLog({
        id_producto: idProducto,
        cambio: cantidad,
        cantidad_final: nuevaCantidad,
        motivo: "Por compra",
        realizado_por: idUsuario,
        fecha: new Date(),
      });
    }
    const nuevoInventario = await InventarioRepository.findByProductoId(
      idProducto
    );

    return nuevoInventario;
  }

  async incrementStock(id_producto, id_sucursal, cantidad, opts = {}) {
    const inv = await this.getInventarioByProductoId(id_producto, id_sucursal, {
      transaction: opts.transaction,
      lock: "UPDATE",
    });
    inv.cantidad += cantidad;
    await InventarioRepository.updateProductoEnSucursal(
      id_producto,
      id_sucursal,
      { cantidad: inv.cantidad },
      { transaction: opts.transaction }
    );
    return inv;
  }
  async incrementStockInsumo(id_insumo, id_sucursal, cantidad, opts = {}) {
    const inv = await this.getInventarioByInsumoId(id_insumo, id_sucursal, {
      transaction: opts.transaction,
      lock: "UPDATE",
    });
    inv.cantidad += cantidad;
    await InventarioRepository.updateInsumoEnSucursal(
      id_insumo,
      id_sucursal,
      { cantidad: inv.cantidad },
      { transaction: opts.transaction }
    );
    return inv;
  }

  async ensureInventarioInsumoSucursal(id_insumo, id_sucursal, opts = {}) {
    let inv = await InventarioRepository.findInsumoEnSucursal(
      id_insumo,
      id_sucursal,
      { transaction: opts.transaction, lock: "UPDATE" }
    );

    if (!inv) {
      inv = await InventarioRepository.createInsumoEnSucursal(
        { id_insumo, id_sucursal, cantidad: 0 },
        { transaction: opts.transaction }
      );
    }
    return inv;
  }

  async incrementarStockInsumoSucursal(
    id_insumo,
    cantidad,
    id_sucursal,
    opts = {}
  ) {
    const qty = Number(cantidad) || 0;
    if (qty <= 0) return null;

    await this.ensureInventarioInsumoSucursal(id_insumo, id_sucursal, opts);

    return await this.incrementStockInsumo(id_insumo, id_sucursal, qty, opts);
  }

  async validarDisponibilidad(id_producto, id_sucursal, cantidad, opts = {}) {
    if (cantidad <= 0) throw new Error("Cantidad debe ser positiva.");
    const inv = await this.getInventarioByProductoId(id_producto, id_sucursal, {
      transaction: opts.transaction,
      lock: "UPDATE",
    });
    return Math.floor(inv.cantidad) >= Math.floor(cantidad);
  }

  async decrementarStock(id_producto, id_sucursal, cantidad, opts = {}) {
    if (cantidad <= 0) throw new Error("Cantidad debe ser positiva.");

    const inv = await this.getInventarioByProductoId(id_producto, id_sucursal, {
      transaction: opts.transaction,
      lock: "UPDATE",
    });
    if (Math.floor(inv.cantidad) < Math.floor(cantidad)) {
      throw new Error("Stock insuficiente en la sucursal.");
    }

    inv.cantidad -= cantidad;
    await InventarioRepository.updateProductoEnSucursal(
      id_producto,
      id_sucursal,
      { cantidad: inv.cantidad },
      { transaction: opts.transaction }
    );
    return inv;
  }

  async decrementarStockInsumo(id_insumo, id_sucursal, cantidad, opts = {}) {
    if (cantidad <= 0) throw new Error("Cantidad debe ser positiva.");

    const inv = await this.getInventarioByInsumoId(id_insumo, id_sucursal, {
      transaction: opts.transaction,
      lock: "UPDATE",
    });
    if (Math.floor(inv.cantidad) < Math.floor(cantidad)) {
      throw new Error("Stock insuficiente en la sucursal.");
    }

    inv.cantidad -= cantidad;
    await InventarioRepository.updateInsumoEnSucursal(
      id_insumo,
      id_sucursal,
      { cantidad: inv.cantidad },
      { transaction: opts.transaction }
    );
    return inv;
  }

  async agregarInventario({ tipo, id_elemento, id_sucursal, cantidad }) {
    if (!id_elemento || !id_sucursal || cantidad == null)
      throw new Error("Faltan datos para inventario");

    if (tipo === "producto") {
      const producto = await ProductosRepository.findById(id_elemento);
      if (!producto) throw new Error("Producto no existe");
    } else if (tipo === "insumo") {
      const insumo = await InsumoRepository.findById(id_elemento);
      if (!insumo) throw new Error("Insumo no existe");
    } else {
      throw new Error("Tipo inválido");
    }

    const sucursal = await SucursalRepository.getSucursalById(id_sucursal);
    if (!sucursal) throw new Error("Sucursal no existe");

    let inventario = await InventarioRepository.findByElementoYSucursal({
      tipo,
      id_elemento,
      id_sucursal,
    });

    const fecha = obtenerFechaActualChile();

    if (inventario) {
      inventario.cantidad += Number(cantidad);
      inventario.fecha_actualizacion = fecha;
      await inventario.save();
    } else {
      const data = {
        id_sucursal,
        cantidad: Number(cantidad),
        fecha_actualizacion: fecha,
      };
      if (tipo === "producto") data.id_producto = id_elemento;
      if (tipo === "insumo") data.id_insumo = id_elemento;

      inventario = await InventarioRepository.create(data);
    }

    return inventario;
  }
}

export default new InventarioService();

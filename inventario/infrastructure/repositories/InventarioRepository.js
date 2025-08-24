import IInventarioRepository from "../../domain/repositories/IInventarioRepository.js";
import Inventario from "../../domain/models/Inventario.js";
import Producto from "../../domain/models/Producto.js";

class InventarioRepository extends IInventarioRepository {
  async findByProductoId(id_producto) {
    return await Inventario.findOne({ where: { id_producto } });
  }

  async findByInsumoId(id_insumo) {
    return await Inventario.findOne({ where: { id_insumo } });
  }

  async findProductoEnSucursal(id_producto, id_sucursal, opts = {}) {
    const q = {
      where: { id_producto, id_sucursal },
      transaction: opts.transaction,
    };
    if (opts.lock && opts.transaction) q.lock = opts.transaction.LOCK.UPDATE;
    return await Inventario.findOne(q);
  }
  async findInsumoEnSucursal(id_insumo, id_sucursal, opts = {}) {
    const q = {
      where: { id_insumo, id_sucursal },
      transaction: opts.transaction,
    };
    if (opts.lock && opts.transaction) q.lock = opts.transaction.LOCK.UPDATE;
    return await Inventario.findOne(q);
  }

  async updateProductoEnSucursal(id_producto, id_sucursal, data, opts = {}) {
    return await Inventario.update(data, {
      where: { id_producto, id_sucursal },
      transaction: opts.transaction,
    });
  }

  async updateInsumoEnSucursal(id_insumo, id_sucursal, data, opts = {}) {
    return await Inventario.update(data, {
      where: { id_insumo, id_sucursal },
      transaction: opts.transaction,
    });
  }

  async findByElementoYSucursal({ tipo, id_elemento, id_sucursal }) {
    if (tipo !== "producto" && tipo !== "insumo") {
      throw new Error("Tipo inválido");
    }

    const where = { id_sucursal };
    if (tipo === "producto") where.id_producto = id_elemento;
    if (tipo === "insumo") where.id_insumo = id_elemento;

    return await Inventario.findOne({ where });
  }

  async findAll() {
    return await Inventario.findAll({
      include: { model: Producto, as: "producto" },
    });
  }

  async create(data) {
    return await Inventario.create(data);
  }

  async createInsumoEnSucursal(
    { id_insumo, id_sucursal, cantidad = 0 },
    opts = {}
  ) {
    const payload = {
      id_insumo,
      id_sucursal,
      cantidad: Number(cantidad) || 0,
      id_producto: null,
    };
    return await Inventario.create(payload, { transaction: opts.transaction });
  }

  async update(id_producto, data) {
    return await Inventario.update(data, { where: { id_producto } });
  }

  async updateInsumo(id_insumo, data) {
    return await Inventario.update(data, { where: { id_insumo } });
  }

  async delete(ids) {
    if (!Array.isArray(ids)) {
      throw new Error("Los IDs deben ser un array.");
    }
    return await Inventario.destroy({ where: { id_producto: ids } });
  }

  async updateByProductoId(idProducto, data) {
    return await Inventario.update(data, {
      where: { id_producto: idProducto },
    });
  }

  getModel() {
    return Inventario;
  }
}

export default new InventarioRepository();

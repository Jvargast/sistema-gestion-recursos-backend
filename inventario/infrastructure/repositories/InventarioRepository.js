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

  async findAll() {
    return await Inventario.findAll({
      include: { model: Producto, as: "producto" },
    });
  }

  async create(data) {
    return await Inventario.create(data);
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

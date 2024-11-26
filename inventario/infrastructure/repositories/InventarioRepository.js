import IInventarioRepository from '../../domain/repositories/IInventarioRepository.js';
import Inventario from '../../domain/models/Inventario.js';
import Producto from '../../domain/models/Producto.js';

class InventarioRepository extends IInventarioRepository {
  async findByProductoId(id_producto) {
    return await Inventario.findOne({ where: { id_producto } });
  }

  async findAll() {
    return await Inventario.findAll();
  }

  async create(data) {
    return await Inventario.create(data);
  }

  async update(id_producto, data) {
    return await Inventario.update(data, { where: { id_producto } });
  }

  async delete(id_producto) {
    return await Inventario.destroy({ where: { id_producto } });
  }
  // Se debe cambiar
  async updateCantidad(idProducto, cantidad) {
    const inventario = await this.findInventarioByProducto(idProducto);
    if (!inventario) throw new Error("Inventario no encontrado");
    inventario.cantidad += cantidad;
    inventario.fecha_actualizacion = new Date();
    await inventario.save();
    return inventario;
  }

  async getInventarioGlobal() {
    return await Inventario.findAll({
      include: { model: Producto, as: "producto" },
    });
  }

  async registrarEntradaInventario(data) {
    return await Inventario.create(data);
  }

  async registrarSalidaInventario(data) {
    return await Inventario.create(data);
  }

  

}

export default new InventarioRepository();

import Insumo from "../../../inventario/domain/models/Insumo.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import DetalleVenta from "../../domain/models/DetalleVenta.js";

class DetalleVentaRepository {
  async findByVentaId(id_venta, options = {}) {
    return await DetalleVenta.findAll({
      where: { id_venta },
      include: [
        { model: Producto, as: "producto" },
        { model: Insumo, as: "insumo" },
      ],
      ...options,
    });
  }

  async create(data, options = {}) {
    return await DetalleVenta.create(data, options);
  }

  async update(id, updates, options = {}) {
    const [updated] = await DetalleVenta.update(updates, {
      where: { id_detalle: id },
      ...options,
    });
    return updated > 0 ? await DetalleVenta.findByPk(id, options) : null;
  }

  async delete(id, options = {}) {
    return await DetalleVenta.destroy({ where: { id_detalle: id }, ...options });
  }

  getModel() {
    return DetalleVenta;
  }
}

export default new DetalleVentaRepository();

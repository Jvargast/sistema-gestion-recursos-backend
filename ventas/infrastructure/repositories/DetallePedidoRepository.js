import Insumo from "../../../inventario/domain/models/Insumo.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import DetallePedido from "../../domain/models/DetallePedido.js";

class DetallePedidoRepository {
  async findByPedidoId(id_pedido, options = {}) {
    return await DetallePedido.findAll({
      where: { id_pedido },
      include: [
        { model: Producto, as: "Producto" },
        { model: Insumo, as: "Insumo" },
      ],
      ...options,
    });
  }

  async create(data, options = {}) {
    return await DetallePedido.create(data, options);
  }

  async update(id, updates, options = {}) {
    const [updated] = await DetallePedido.update(updates, {
      where: { id_detalle_pedido: id },
      ...options,
    });
    return updated > 0 ? await DetallePedido.findByPk(id, options) : null;
  }

  async delete(id, options = {}) {
    return await DetallePedido.destroy({
      where: { id_detalle_pedido: id },
      ...options,
    });
  }

  async deleteByPedidoId(id_pedido, options = {}) {
    return await DetallePedido.destroy({ where: { id_pedido }, ...options });
  }

  getModel() {
    return DetallePedido;
  }
}

export default new DetallePedidoRepository();

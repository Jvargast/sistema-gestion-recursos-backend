import Insumo from "../../../inventario/domain/models/Insumo.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import DetallePedido from "../../domain/models/DetallePedido.js";

class DetallePedidoRepository {
  async findByPedidoId(id_pedido) {
    return await DetallePedido.findAll({
      where: { id_pedido },
      include: [
        { model: Producto, as: "Producto" },
        { model: Insumo, as: "Insumo" },
      ],
    });
  }

  async create(data) {
    return await DetallePedido.create(data);
  }

  async update(id, updates) {
    const [updated] = await DetallePedido.update(updates, {
      where: { id_detalle_pedido: id },
    });
    return updated > 0 ? await DetallePedido.findByPk(id) : null;
  }

  async delete(id) {
    return await DetallePedido.destroy({ where: { id_detalle_pedido: id } });
  }

  getModel() {
    return DetallePedido;
  }
}

export default new DetallePedidoRepository();

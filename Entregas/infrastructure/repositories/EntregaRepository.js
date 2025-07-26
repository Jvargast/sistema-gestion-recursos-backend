import { Op } from "sequelize";
import Cliente from "../../../ventas/domain/models/Cliente.js";
import Entrega from "../../domain/models/Entrega.js";

class EntregaRepository {
  async create(data) {
    return await Entrega.create(data);
  }

  async findById(id) {
    return await Entrega.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: "cliente",
        },
      ],
    });
  }

  async findByPedidoId(id_pedido, options = {}) {
    return await Entrega.findOne({
      where: { id_pedido },
      ...options,
    });
  }

  async findEntregaParaReversa({ id_pedido }, options = {}) {
    return await Entrega.findOne({
      where: {
        id_pedido,
        estado_entrega: { [Op.ne]: "anulada" },
      },
      order: [["fecha_hora", "DESC"]],
      ...options,
    });
  }

  async findAll() {
    return await Entrega.findAll({
      include: ["usuario"],
    });
  }

  async update(id, data) {
    const entrega = await Entrega.findByPk(id);
    if (!entrega) {
      throw new Error("Entrega not found");
    }
    return await entrega.update(data);
  }

  async updateDesdeAnulacion(id, updates, options = {}) {
    const [updated] = await Entrega.update(updates, {
      where: { id_entrega: id },
      ...options,
    });
    return updated > 0 ? await this.findById(id, options) : null;
  }

  async delete(id) {
    const entrega = await Entrega.findByPk(id);
    if (!entrega) {
      throw new Error("Entrega not found");
    }
    return await entrega.destroy();
  }

  getModel() {
    return Entrega;
  }
}

export default new EntregaRepository();

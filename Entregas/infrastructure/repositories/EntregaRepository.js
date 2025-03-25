import Cliente from "../../../ventas/domain/models/Cliente.js";
import Entrega from "../../domain/models/Entrega.js";


class EntregaRepository {
  async create(data) {
    return await Entrega.create(data);
  }

  async findById(id) {
    return await Entrega.findByPk(id, {
      include: [{
        model: Cliente,
        as: "cliente"
      }],
    });
  }

  async findAll() {
    return await Entrega.findAll({
      include: ['usuario'],
    });
  }

  async update(id, data) {
    const entrega = await Entrega.findByPk(id);
    if (!entrega) {
      throw new Error('Entrega not found');
    }
    return await entrega.update(data);
  }

  async delete(id) {
    const entrega = await Entrega.findByPk(id);
    if (!entrega) {
      throw new Error('Entrega not found');
    }
    return await entrega.destroy();
  }

  getModel() {
    return Entrega;
  }
}

export default new EntregaRepository();

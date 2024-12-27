import Camion from "../../domain/models/Camion.js";
import InventarioCamion from "../../domain/models/InventarioCamion.js";

class CamionRepository {
  async create(data) {
    return await Camion.create(data);
  }

  async findById(id) {
    return await Camion.findByPk(id, {
      include: [{ model: InventarioCamion, as: "inventario" }],
    });
  }

  async findAll() {
    return await Camion.findAll({
      include: [{ model: InventarioCamion, as: "inventario" }],
    });
  }

  async update(id, data) {
    const camion = await Camion.findByPk(id);
    if (!camion) {
      throw new Error("Camion not found");
    }
    return await camion.update(data);
  }

  async delete(id) {
    const camion = await Camion.findByPk(id);
    if (!camion) {
      throw new Error("Camion not found");
    }
    return await camion.destroy();
  }
}

export default new CamionRepository();

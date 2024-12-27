// InventarioCamionRepository.js

import Producto from "../../../inventario/domain/models/Producto.js";
import Camion from "../../domain/models/Camion.js";
import InventarioCamion from "../../domain/models/InventarioCamion.js";

class InventarioCamionRepository {
  async create(data) {
    return await InventarioCamion.create(data);
  }

  async findById(id) {
    return await InventarioCamion.findByPk(id, {
      include: [
        { model: Camion, as: 'camion' },
        { model: Producto, as: 'producto' },
      ],
    });
  }

  async findAll() {
    return await InventarioCamion.findAll({
      include: [
        { model: Camion, as: 'camion' },
        { model: Producto, as: 'producto' },
      ],
    });
  }

  async findByCamionId(idCamion) {
    return await InventarioCamion.findAll({
      where: { id_camion: idCamion },
      include: [{ model: Producto, as: 'producto' }],
    });
  }

  async update(id, data) {
    const inventario = await InventarioCamion.update(data, { where: { id_producto: id } });
    if (!inventario) {
      throw new Error('InventarioCamion not found');
    }
    return inventario;
  }

  async delete(id) {
    const inventario = await InventarioCamion.findByPk(id);
    if (!inventario) {
      throw new Error('InventarioCamion not found');
    }
    return await inventario.destroy();
  }
}

export default new InventarioCamionRepository();
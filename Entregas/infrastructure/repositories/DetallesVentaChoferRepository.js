// repositories/DetallesVentaChoferRepository.js

import DetallesVentaChofer from "../../domain/models/DetallesVentaChofer.js";

class DetallesVentaChoferRepository {
  async create(data) {
    return await DetallesVentaChofer.create(data);
  }

  async findByVentaId(id_venta_chofer, options = {}) {
    return await DetallesVentaChofer.findAll({
      where: { id_venta_chofer },
      ...options,
    });
  }

  async findByInventarioCamion(id_inventario_camion, options = {}) {
    return await DetallesVentaChofer.findAll({
      where: { id_inventario_camion },
      ...options,
    });
  }

  async updateByInventarioCamion(id_inventario_camion, updateData) {
    if (!id_inventario_camion || !updateData) {
      throw new Error("id_inventario_camion y updateData son requeridos.");
    }

    return await DetallesVentaChofer.update(updateData, {
      where: { id_inventario_camion },
    });
  }

  getModel() {
    return DetallesVentaChofer;
  }
}

export default new DetallesVentaChoferRepository();

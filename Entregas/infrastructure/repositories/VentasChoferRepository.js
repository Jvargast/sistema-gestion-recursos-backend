// repositories/VentasChoferRepository.js

import VentasChofer from "../../domain/models/VentasChofer.js";

class VentasChoferRepository {
  async create(data) {
    return await VentasChofer.create(data);
  }

  async findById(id, options = {}) {
    return await VentasChofer.findByPk(id, options);
  }

  async findAllByCamion(id_camion, options = {}) {
    return await VentasChofer.findAll({
      where: { id_camion },
      ...options,
    });
  }

  async update(id, updates) {
    return await VentasChofer.update(updates, {
      where: { id_venta_chofer: id },
    });
  }

  getModel(){
    return VentasChofer;
  }
}

export default new VentasChoferRepository();

import IVentasEstadisticasRepository from "../../domain/repositories/IVentasEstadisticasRepository.js";
import VentasEstadisticas from "../../domain/models/VentasEstadisticas.js";

class VentasEstadisticasRepository extends IVentasEstadisticasRepository {

  async findByYear(year) {
    return await VentasEstadisticas.findAll({
      where: { anio: year },
    });
  }

  async findAll() {
    return await VentasEstadisticas.findAll();
  }

  async create(data) {
    return await VentasEstadisticas.create(data);
  }

  async updateByYear(year, data) {
    return await VentasEstadisticas.update(data, { where: { anio: year } });
  }

  async deleteByYear(year) {
    return await VentasEstadisticas.destroy({ where: { anio: year } });
  }
}

export default new VentasEstadisticasRepository();

import PagosEstadisticas from "../../domain/models/PagosEstadisticas.js";

class PagosEstadisticasRepository {
  async findAllByMesYAnio(mes, anio) {
    return await PagosEstadisticas.findAll({ where: { mes, anio } });
  }

  async create(data) {
    return await PagosEstadisticas.create(data);
  }

  async deleteByFecha(fecha) {
    return await PagosEstadisticas.destroy({ where: { fecha } });
  }
}

export default new PagosEstadisticasRepository();

import EntregasEstadisticas from "../../domain/models/EntregasEstadisticas.js";

class EntregasEstadisticasRepository {
  async findByChoferYMes(id_chofer, mes, anio) {
    return await EntregasEstadisticas.findAll({
      where: { id_chofer, mes, anio },
    });
  }

  async create(data) {
    return await EntregasEstadisticas.create(data);
  }

  async deleteByFecha(fecha) {
    return await EntregasEstadisticas.destroy({ where: { fecha } });
  }
}

export default new EntregasEstadisticasRepository();

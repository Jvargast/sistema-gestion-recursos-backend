import VentasChoferEstadisticas from "../../domain/models/VentasChoferEstadisticas.js";

class VentasChoferEstadisticasRepository {
  async findByChoferYMes(id_chofer, mes, anio) {
    return await VentasChoferEstadisticas.findAll({
      where: { id_chofer, mes, anio },
    });
  }

  async create(data) {
    return await VentasChoferEstadisticas.create(data);
  }

  async deleteByFecha(fecha) {
    return await VentasChoferEstadisticas.destroy({ where: { fecha } });
  }
}

export default new VentasChoferEstadisticasRepository();

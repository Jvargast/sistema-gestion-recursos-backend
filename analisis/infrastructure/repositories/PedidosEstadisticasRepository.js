import PedidosEstadisticas from "../../domain/models/PedidosEstadisticas.js";

class PedidosEstadisticasRepository {
  async findAllByMesYAnio(mes, anio) {
    return await PedidosEstadisticas.findAll({ where: { mes, anio } });
  }

  async create(data) {
    return await PedidosEstadisticas.create(data);
  }

  async deleteByFecha(fecha) {
    return await PedidosEstadisticas.destroy({ where: { fecha } });
  }
}

export default new PedidosEstadisticasRepository();

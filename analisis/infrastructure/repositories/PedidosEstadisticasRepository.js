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

  async updateById(id, data) {
    return await PedidosEstadisticas.update(data, {
      where: { id },
    });
  }

  async findByFechaEstadoPagoYEstadoPedido(
    fecha,
    estado_pago,
    id_estado_pedido
  ) {
    return await PedidosEstadisticas.findOne({
      where: {
        fecha,
        estado_pago,
        id_estado_pedido,
      },
    });
  }
  async findByFecha(fecha) {
    return await PedidosEstadisticas.findAll({
      where: { fecha },
    });
  }
}

export default new PedidosEstadisticasRepository();

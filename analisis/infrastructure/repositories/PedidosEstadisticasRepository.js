import PedidosEstadisticas from "../../domain/models/PedidosEstadisticas.js";

class PedidosEstadisticasRepository {
  async findByClaveDiaria({
    fecha,
    estado_pago,
    id_estado_pedido,
    id_sucursal,
  }) {
    return PedidosEstadisticas.findOne({
      where: {
        fecha,
        estado_pago,
        id_estado_pedido,
        ...(id_sucursal != null ? { id_sucursal } : {}),
      },
    });
  }
  
  async findAllByMesYAnio(mes, anio, { id_sucursal } = {}) {
    return await PedidosEstadisticas.findAll({
      where: { mes, anio, ...(id_sucursal ? { id_sucursal } : {}) },
    });
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
  async findByFecha(fecha, { id_sucursal } = {}) {
    return await PedidosEstadisticas.findAll({
      where: { fecha, ...(id_sucursal ? { id_sucursal } : {}) },
      raw: true,
    });
  }
}

export default new PedidosEstadisticasRepository();

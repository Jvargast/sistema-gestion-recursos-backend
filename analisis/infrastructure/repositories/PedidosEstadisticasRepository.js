import PedidosEstadisticas from "../../domain/models/PedidosEstadisticas.js";
import sequelize from "../../../database/database.js";

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
        id_sucursal,
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

  async saveByKey({
    fecha,
    estado_pago,
    id_estado_pedido,
    id_sucursal = null,
    data,
  }) {
    return await sequelize.transaction(async (transaction) => {
      const existentes = await PedidosEstadisticas.findAll({
        where: {
          fecha,
          estado_pago,
          id_estado_pedido,
          id_sucursal,
        },
        order: [["id", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existentes.length === 0) {
        return await PedidosEstadisticas.create(
          {
            fecha,
            estado_pago,
            id_estado_pedido,
            id_sucursal,
            ...data,
          },
          { transaction }
        );
      }

      const [principal, ...duplicados] = existentes;

      await principal.update(data, { transaction });

      if (duplicados.length > 0) {
        await PedidosEstadisticas.destroy({
          where: { id: duplicados.map((registro) => registro.id) },
          transaction,
        });
      }

      return await principal.reload({ transaction });
    });
  }

  async deleteByFecha(fecha) {
    return await PedidosEstadisticas.destroy({ where: { fecha } });
  }

  async updateById(id, data) {
    await PedidosEstadisticas.update(data, {
      where: { id },
    });
    return await PedidosEstadisticas.findByPk(id);
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

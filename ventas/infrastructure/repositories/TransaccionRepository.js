import ITransaccionRepository from "../../domain/repositories/ITransaccionRepository.js";
import Transaccion from "../../domain/models/Transaccion.js";
import EstadoTransaccion from "../../domain/models/EstadoTransaccion.js";
import Cliente from "../../domain/models/Cliente.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import { Op } from "sequelize";

class TransaccionRepository extends ITransaccionRepository {
  async findById(id) {
    return await Transaccion.findByPk(id, {
      include: [
        { model: EstadoTransaccion, as: "estado" },
        { model: Cliente, as: "cliente" },
        { model: Usuarios, as: "usuario" },
      ],
    });
  }

  async findAll() {
    return await Transaccion.findAll({
      include: [
        { model: EstadoTransaccion, as: "estado" },
        { model: Cliente, as: "cliente" },
        { model: Usuarios, as: "usuario" },
      ],
    });
  }

  async findAllWithConditions(conditions) {
    return await Transaccion.findAll(conditions);
  }

  async findByIds(ids) {
    return await Transaccion.findAll({
      where: { id_transaccion: ids },
    });
  }

  async bulkDelete(ids) {
    return await Transaccion.destroy({
      where: { id_transaccion: ids },
    });
  }

  async create(data) {
    return await Transaccion.create(data);
  }

  async update(id, data) {
    return await Transaccion.update(data, { where: { id_transaccion: id } });
  }

  async updateBulk(data, condition) {
    return await Transaccion.update(data, { where: condition });
  }

  async getVentasCompletadasEnRango(fechaInicio, fechaFin) {
    return await Transaccion.count({
      where: {
        fecha_creacion: {
          [Op.gte]: fechaInicio, // Mayor o igual que la fecha de inicio
          [Op.lt]: fechaFin, // Menor que la fecha de fin
        },
      },
      include: [
        {
          model: EstadoTransaccion,
          as: "estado", // Alias en la relación
          where: { nombre_estado: "Completada" }, // Filtrar solo por transacciones completadas
        },
      ],
    });
  }

  getModel() {
    return Transaccion;
  }
}

export default new TransaccionRepository();

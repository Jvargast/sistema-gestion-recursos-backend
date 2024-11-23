import ITransaccionRepository from "../../domain/repositories/ITransaccionRepository.js";
import Transaccion from "../../domain/models/Transaccion.js";
import EstadoTransaccion from "../../domain/models/EstadoTransaccion.js";
import Cliente from "../../domain/models/Cliente.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

class TransaccionRepository extends ITransaccionRepository {
  async findById(id) {
    return await Transaccion.findByPk(id, {
      include: [
        { model: EstadoTransaccion, as: "estado" },
        { model: Cliente, as: "cliente" },
        { model: Usuarios, as: "usuario"}
      ],
    });
  }

  async findAll() {
    return await Transaccion.findAll({
      include: [
        { model: EstadoTransaccion, as: "estado" },
        { model: Cliente, as: "cliente" },
        { model: Usuarios, as: "usuario"}
      ],
    });
  }

  async findByIds(ids) {
    console.log(ids)
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

  getModel() {
    return Transaccion;
  }
}

export default new TransaccionRepository();

import IPagoRepository from "../../domain/repositories/IPagoRepository.js";
import Pago from "../../domain/models/Pago.js";
import EstadoPago from "../../domain/models/EstadoPago.js";
import MetodoPago from "../../domain/models/MetodoPago.js";

class PagoRepository extends IPagoRepository {
  async findById(id) {
    return await Pago.findByPk(id, {
      include: [
        { model: EstadoPago, as: "estado" },
        { model: MetodoPago, as: "metodo" },
      ],
    });
  }

  async findByTransaccionId(transaccionId) {
    return await Pago.findAll({
      where: { id_transaccion: transaccionId },
      include: [
        { model: EstadoPago, as: "estado" },
        { model: MetodoPago, as: "metodo" },
      ],
    });
  }

  async create(data) {
    return await Pago.create(data);
  }
}

export default new PagoRepository();

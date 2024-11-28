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

  async updateEstado(id_pago, nuevo_estado) {
    const pago = await Pago.findByPk(id_pago);
    if (!pago) {
      throw new Error(`Pago con ID ${id_pago} no encontrado.`);
    }

    pago.id_estado_pago = nuevo_estado;
    await pago.save();

    return pago;
  }
}

export default new PagoRepository();

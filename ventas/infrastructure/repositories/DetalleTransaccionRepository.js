import IDetalleTransaccionRepository from "../../domain/repositories/IDetalleTransaccionRepository.js";
import DetalleTransaccion from "../../domain/models/DetalleTransaccion.js";
import Producto from "../../../inventario/domain/models/Producto.js";

class DetalleTransaccionRepository extends IDetalleTransaccionRepository {
  async findByTransaccionId(transaccionId) {
    return await DetalleTransaccion.findAll({
      where: { id_transaccion: transaccionId },
      include: { model: Producto, as: "producto" },
    });
  }

  async findById(id_detalle_transaccion) {
    return await DetalleTransaccion.findOne({
      where: { id_detalle_transaccion: id_detalle_transaccion },
    });
  }

  async create(data) {
    return await DetalleTransaccion.create(data);
  }

  async bulkCreate(data) {
    return await DetalleTransaccion.bulkCreate(data);
  }

  async update(id, data) {
    return await DetalleTransaccion.update(data, { where: { id_detalle: id } });
  }

  async delete(id) {
    return await DetalleTransaccion.destroy({ where: { id_detalle: id } });
  }

  async deleteByTransaccionId(transaccionId) {
    return await DetalleTransaccion.destroy({
      where: { id_transaccion: transaccionId },
    });
  }
}

export default new DetalleTransaccionRepository();

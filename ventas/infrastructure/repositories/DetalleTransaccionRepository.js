import IDetalleTransaccionRepository from "../../domain/repositories/IDetalleTransaccionRepository.js";
import DetalleTransaccion from "../../domain/models/DetalleTransaccion.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import CategoriaProducto from "../../../inventario/domain/models/CategoriaProducto.js";
import EstadoProducto from "../../../inventario/domain/models/EstadoProducto.js";
import TipoProducto from "../../../inventario/domain/models/TipoProducto.js";
import EstadoDetalleTransaccion from "../../domain/models/EstadoDetalleTransaccion.js";

class DetalleTransaccionRepository extends IDetalleTransaccionRepository {
  async findByTransaccionId(id_transaccion) {
    return await DetalleTransaccion.findAll({
      where: { id_transaccion },
      include: [
        {
          model: Producto,
          as: "producto",
          include: [
            { model: CategoriaProducto, as: "categoria" },
            { model: EstadoProducto, as: "estado" },
            { model: TipoProducto, as: "tipo" },
          ],
        },
        {
          model: EstadoDetalleTransaccion,
          as: "estado",
          attributes: ["id_estado_detalle_transaccion", "nombre_estado"],
        },
      ],
    });
  }

  async findOne(id_transaccion, id_detalle) {
    return await DetalleTransaccion.findOne({
      where: {
        id_transaccion: id_transaccion,
        id_detalle_transaccion: id_detalle,
      },
    });
  }

  async findAllWithConditions(conditions) {
    return await DetalleTransaccion.findAll(conditions);
  }

  async findById(id_detalle_transaccion) {
    return await DetalleTransaccion.findOne({
      where: { id_detalle_transaccion },
      include: {
        model: Producto,
        as: "producto",
        include: [
          { model: CategoriaProducto, as: "categoria" },
          { model: EstadoProducto, as: "estado" },
          { model: TipoProducto, as: "tipo" },
        ],
      },
    });
  }

  async create(data) {
    return await DetalleTransaccion.create(data);
    /* if (!Array.isArray(data) || data.length === 0) {
      throw new Error(
        "Los datos proporcionados no son válidos para crear detalles."
      );
    }
    return await DetalleTransaccion.bulkCreate(data, { validate: true }); */
  }

  async bulkCreate(data) {
    return await DetalleTransaccion.bulkCreate(data);
  }

  async update(id, data) {
    return await DetalleTransaccion.update(data, {
      where: { id_detalle_transaccion: id },
    });
  }

  async delete(id) {
    return await DetalleTransaccion.destroy({
      where: { id_detalle_transaccion: id },
    });
  }

  async deleteByTransaccionId(transaccionId) {
    return await DetalleTransaccion.destroy({
      where: { id_transaccion: transaccionId },
    });
  }

  async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("El parámetro 'ids' debe ser un array no vacío.");
    }

    return await DetalleTransaccion.findAll({
      where: {
        id_detalle_transaccion: ids, // Campo correspondiente al ID
      },
    });
  }

  async bulkDelete(ids) {
    return await DetalleTransaccion.destroy({
      where: {
        id_detalle_transaccion: ids,
      },
    });
  }

  async findAllByAgenda(id_agenda_carga) {
    const detalles = await DetalleTransaccion.findAll({
      where: {
        id_agenda_carga, // Buscar por el ID de la agenda
      },
    });
    return detalles;
  }

  getModel() {
    return DetalleTransaccion;
  }
}

export default new DetalleTransaccionRepository();

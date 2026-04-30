import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import AgendaCargaDetalle from "../../domain/models/AgendaCargaDetalle.js";
import Camion from "../../domain/models/Camion.js";

class AgendaCargaDetalleRepository {
  async create(detalleData, options = {}) {
    return await AgendaCargaDetalle.create(detalleData, options);
  }

  async findByAgendaAndPedido(id_agenda_carga, id_pedido, options = {}) {
    return await AgendaCargaDetalle.findAll({
      where: {
        id_agenda_carga,
        id_pedido,
      },
      ...options,
    });
  }

  async bulkCreate(detalles, options = {}) {
    return await AgendaCargaDetalle.bulkCreate(detalles, options);
  }

  async findByAgendaId(id_agenda_carga, options = {}) {
    return await AgendaCargaDetalle.findAll({
      where: { id_agenda_carga },
      include: [
        {
          model: Producto,
          as: "producto",
          attributes: [
            "id_producto",
            "nombre_producto",
            "marca",
            "codigo_barra",
            "image_url",
            "es_retornable",
            "descripcion",
          ],
        },
        {
          model: Insumo,
          as: "insumo",
          attributes: [
            "id_insumo",
            "nombre_insumo",
            "unidad_de_medida",
            "codigo_barra",
            "image_url",
            "descripcion",
          ],
        },
      ],
      order: [["id_agenda_carga_detalle", "ASC"]],
      ...options,
    });
  }

  async update(id, data, options = {}) {
    return await AgendaCargaDetalle.update(data, {
      where: { id_agenda_carga_detalle: id },
      ...options,
    });
  }

  async updateEstadoByAgendaId(id_agenda_carga, estado, options = {}) {
    return await AgendaCargaDetalle.update(estado, {
      where: { id_agenda_carga },
      ...options,
    });
  }

  async delete(id, options = {}) {
    return await AgendaCargaDetalle.destroy({
      where: { id_agenda_carga_detalle: id },
      ...options,
    });
  }

  async deleteByAgendaId(id_agenda_carga, options = {}) {
    return await AgendaCargaDetalle.destroy({
      where: { id_agenda_carga },
      ...options,
    });
  }

  getModel() {
    return AgendaCargaDetalle;
  }
}

export default new AgendaCargaDetalleRepository();

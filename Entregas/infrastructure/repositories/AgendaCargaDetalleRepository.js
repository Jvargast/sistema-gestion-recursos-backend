import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import AgendaCargaDetalle from "../../domain/models/AgendaCargaDetalle.js";
import Camion from "../../domain/models/Camion.js";

class AgendaCargaDetalleRepository {
  async create(detalleData) {
    return await AgendaCargaDetalle.create(detalleData);
  }

  async bulkCreate(detalles) {
    return await AgendaCargaDetalle.bulkCreate(detalles);
  }

  async findByAgendaId(id_agenda_carga) {
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
    });
  }

  async update(id, data) {
    return await AgendaCargaDetalle.update(data, {
      where: { id_agenda_carga_detalle: id },
    });
  }

  async updateEstadoByAgendaId(id_agenda_carga, estado) {
    return await AgendaCargaDetalle.update(estado, {
      where: { id_agenda_carga },
    });
  }

  async delete(id) {
    return await AgendaCargaDetalle.destroy({
      where: { id_agenda_carga_detalle: id },
    });
  }

  async deleteByAgendaId(id_agenda_carga) {
    return await AgendaCargaDetalle.destroy({ where: { id_agenda_carga } });
  }

  getModel() {
    return AgendaCargaDetalle;
  }
}

export default new AgendaCargaDetalleRepository();

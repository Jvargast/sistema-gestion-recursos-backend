import AgendaCargaDetalle from "../../domain/models/AgendaCargaDetalle.js";

class AgendaCargaDetalleRepository {
  async create(detalleData) {
    return await AgendaCargaDetalle.create(detalleData);
  }

  async bulkCreate(detalles) {
    return await AgendaCargaDetalle.bulkCreate(detalles);
  }

  async findByAgendaId(id_agenda_carga) {
    return await AgendaCargaDetalle.findAll({ where: { id_agenda_carga } });
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

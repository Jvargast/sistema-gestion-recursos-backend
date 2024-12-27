import AgendaCarga from "../../domain/models/AgendaCarga.js";


class AgendaCargaRepository {
  async create(data) {
    return await AgendaCarga.create(data);
  }

  async findById(id) {
    return await AgendaCarga.findByPk(id, {
      include: ['detalles', 'usuario'], // Relaciones asociadas
    });
  }

  async findAll() {
    return await AgendaCarga.findAll({
      include: ['detalles', 'usuario'],
    });
  }

  async update(id, data) {
    const agenda = await AgendaCarga.findByPk(id);
    if (!agenda) {
      throw new Error('Agenda not found');
    }
    return await agenda.update(data);
  }

  async delete(id) {
    const agenda = await AgendaCarga.findByPk(id);
    if (!agenda) {
      throw new Error('Agenda not found');
    }
    return await agenda.destroy();
  }
}

export default new AgendaCargaRepository();

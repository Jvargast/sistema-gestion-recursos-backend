import Usuarios from "../../../auth/domain/models/Usuarios.js";
import AgendaCarga from "../../domain/models/AgendaCarga.js";
import AgendaCargaDetalle from "../../domain/models/AgendaCargaDetalle.js";
import Camion from "../../domain/models/Camion.js";

class AgendaCargaRepository {
  async create(data, options = {}) {
    return await AgendaCarga.create(data, options);
  }

  async findOneByCamion(id_camion, options = {}) {
    return await AgendaCarga.findOne({
      where: {
        id_camion,
      },
      ...options,
    });
  }

  async findOneByConditions(conditions) {
    return await AgendaCarga.findOne(conditions);
  }

  async findByPk(id_agenda_carga, options = {}) {
    return await AgendaCarga.findByPk(id_agenda_carga, options);
  }

  async findById(id, options = {}) {
    return await AgendaCarga.findByPk(id, {
      include: [
        {
          model: Usuarios,
          as: "chofer",
          attributes: ["rut", "nombre", "apellido", "email"],
        },
        {
          model: Camion,
          as: "camion",
          attributes: ["id_camion", "placa", "capacidad", "estado"],
        },
        {
          model: AgendaCargaDetalle,
          as: "detallesCarga",
        },
      ],
      ...options,
    });
  }

  async findAll(data) {
    return await AgendaCarga.findAll(data);
  }

  async update(id, data, options = {}) {
    const agenda = await AgendaCarga.findByPk(id, options);
    if (!agenda) {
      throw new Error("Agenda not found");
    }
    return await agenda.update(data, options);
  }

  async delete(id, options = {}) {
    const agenda = await AgendaCarga.findByPk(id, options);
    if (!agenda) {
      throw new Error("Agenda not found");
    }
    return await agenda.destroy(options);
  }
  async findByChoferAndEstado(rut, estado, options = {}) {
    return await AgendaCarga.findOne({
      where: {
        id_usuario_chofer: rut,
        estado: estado,
      },
      include: [
        {
          model: Camion,
          as: "camion",
          attributes: ["id_camion", "placa", "estado"],
        },
      ],
      ...options,
    });
  }

  async findByCamionAndEstado(id_camion, estado, options = {}) {
    try {
      const agenda = await AgendaCarga.findOne({
        where: {
          id_camion,
          estado,
        },
        ...options,
      });

      return agenda;
    } catch (error) {
      console.error("Error en findByCamionAndEstado:", error);
      throw new Error(
        "No se pudo obtener la agenda para el camión y estado especificados."
      );
    }
  }

  getModel() {
    return AgendaCarga;
  }
}

export default new AgendaCargaRepository();

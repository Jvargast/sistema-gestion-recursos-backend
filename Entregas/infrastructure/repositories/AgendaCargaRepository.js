import Usuarios from "../../../auth/domain/models/Usuarios.js";
import AgendaCarga from "../../domain/models/AgendaCarga.js";
import AgendaCargaDetalle from "../../domain/models/AgendaCargaDetalle.js";
import Camion from "../../domain/models/Camion.js";

class AgendaCargaRepository {
  async create(data) {
    return await AgendaCarga.create(data);
  }

  async findOneByCamion(id_camion) {
    return await AgendaCarga.findOne({
      where: {
        id_camion,
      },
    });
  }

  async findOneByConditions(conditions) {
    return await AgendaCarga.findOne(conditions);
  }

  async findByPk(id_agenda_carga) {
    return await AgendaCarga.findByPk(id_agenda_carga);
  }

  async findById(id) {
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
    });
  }

  async findAll(data) {
    return await AgendaCarga.findAll(data);
  }

  async update(id, data) {
    const agenda = await AgendaCarga.findByPk(id);
    if (!agenda) {
      throw new Error("Agenda not found");
    }
    return await agenda.update(data);
  }

  async delete(id) {
    const agenda = await AgendaCarga.findByPk(id);
    if (!agenda) {
      throw new Error("Agenda not found");
    }
    return await agenda.destroy();
  }
  async findByChoferAndEstado(rut, estado) {
    return await AgendaCarga.findOne({
      where: {
        id_usuario_chofer: rut,
        estado: estado,
      },
      include: [
        {
          model: Camion,
          as: "camion", // Relación definida en los modelos
          attributes: ["id_camion", "placa", "estado"],
        },
      ],
    });
  }

  async findByCamionAndEstado(id_camion, estado) {
    try {
      const agenda = await AgendaCarga.findOne({
        where: {
          id_camion,
          estado,
        },
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

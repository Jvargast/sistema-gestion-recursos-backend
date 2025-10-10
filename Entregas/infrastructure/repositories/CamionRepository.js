import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Camion from "../../domain/models/Camion.js";
import InventarioCamion from "../../domain/models/InventarioCamion.js";

class CamionRepository {
  async create(data) {
    return await Camion.create(data);
  }

  async findById(id) {
    return await Camion.findByPk(id, {
      include: [
        {
          model: InventarioCamion,
          as: "inventarioCamion",
          attributes: ["id_camion", "cantidad"],
        },
        {
          model: Usuarios,
          as: "chofer",
          attributes: ["nombre"],
        },
      ],
    });
  }

  async findByChofer(id_chofer_asignado) {
    return await Camion.findOne({ where: { id_chofer_asignado } });
  }

  async findByChoferId(id_chofer) {
    return await Camion.findOne({
      where: { id_chofer_asignado: id_chofer },
    });
  }

  async findAll() {
    return await Camion.findAll({
      include: [
        { model: InventarioCamion, as: "inventarioCamion" },
        {
          model: Usuarios,
          as: "chofer",
          attributes: ["nombre"],
        },
      ],
      order: [["id_camion", "ASC"]],
    });
  }

  async update(id, data) {
    const camion = await Camion.findByPk(id);
    if (!camion) {
      throw new Error("Camion not found");
    }
    return await camion.update(data);
  }

  async delete(id) {
    const camion = await Camion.findByPk(id, {
      attributes: ["id_camion", "id_chofer_asignado"],
    });
    if (!camion) {
      const err = new Error("Camión no encontrado");
      err.code = "CAMION_NOT_FOUND";
      throw err;
    }
    if (camion.id_chofer_asignado) {
      const err = new Error(
        "No se puede eliminar: el camión tiene un chofer asignado."
      );
      err.code = "CAMION_TIENE_CHOFER";
      throw err;
    }
    await camion.destroy();
    return true;
  }

  getModel() {
    return Camion;
  }
}

export default new CamionRepository();

import UbicacionChofer from "../../domain/models/UbicacionChofer.js";
import Usuarios from "../../domain/models/Usuarios.js";

class UbicacionChoferRepository {
  /**
   * @param {Object} data
   * @returns {Promise<UbicacionChofer>}
   */
  async create(data) {
    return await UbicacionChofer.create(data);
  }

  /**

   * @param {string} rut 
   * @param {Object} [options] 
   * @returns {Promise<UbicacionChofer[]>}
   */
  async getByRut(rut, options = {}) {
    const query = {
      where: { rut },
      order: [["fecha_hora", "DESC"]],
      ...options, // para agregar limit, offset, etc si lo necesitas
      include: [
        {
          model: Usuarios,
          as: "chofer",
          attributes: ["rut", "nombre", "apellido"],
        },
      ],
    };
    return await UbicacionChofer.findAll(query);
  }
}

export default new UbicacionChoferRepository();

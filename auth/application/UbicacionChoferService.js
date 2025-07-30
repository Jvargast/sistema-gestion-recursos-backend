import UbicacionChoferRepository from "../infraestructure/repositories/UbicacionChoferRepository.js";

class UbicacionChoferService {
  /**
   * @param {Object} ubicacionData
   * @returns {Promise<UbicacionChofer>}
   */
  async registrarUbicacion(ubicacionData) {
    return await UbicacionChoferRepository.create(ubicacionData);
  }

  /**
   * @param {string} rut
   * @param {Object} [options]
   * @returns {Promise<UbicacionChofer[]>}
   */
  async obtenerHistorialPorRut(rut, options = {}) {
    return await UbicacionChoferRepository.getByRut(rut, options);
  }

  /**
   * @param {string} rut
   * @returns {Promise<UbicacionChofer|null>}
   */
  async obtenerUltimaUbicacion(rut) {
    const result = await UbicacionChoferRepository.getByRut(rut, { limit: 1 });
    return result.length > 0 ? result[0] : null;
  }
}

export default new UbicacionChoferService();

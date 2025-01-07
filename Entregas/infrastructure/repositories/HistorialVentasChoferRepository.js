// repositories/HistorialVentasChoferRepository.js

import HistorialVentasChofer from "../../domain/models/HistorialVentasChofer.js";

class HistorialVentasChoferRepository {
  /**
   * Crear un nuevo registro en el historial de ventas del chofer.
   * @param {Object} historial - Los datos del historial.
   * @param {Object} [options={}] - Opciones adicionales para la transacción.
   * @returns {Promise<Object>} El historial creado.
   */
  async create(data) {
    return await HistorialVentasChofer.create(data);
  }

  /**
   * Buscar un historial por ID.
   * @param {number} id - El ID del historial.
   * @param {Object} [options={}] - Opciones adicionales para la consulta.
   * @returns {Promise<Object|null>} El historial encontrado o null si no existe.
   */
  async findById(id, options = {}) {
    return await HistorialVentasChofer.findByPk(id, options);
  }

  /**
   * Obtener todos los historiales de un chofer.
   * @param {number} id_chofer - El ID del chofer.
   * @param {Object} [options={}] - Opciones adicionales para la consulta.
   * @returns {Promise<Array>} Lista de historiales del chofer.
   */
  async findAllByChofer(id_chofer, options = {}) {
    return await HistorialVentasChofer.findAll({
      where: { id_chofer },
      ...options,
    });
  }

  /**
   * Obtener todos los historiales por ID de venta chofer.
   * @param {number} id_venta_chofer - El ID de la venta del chofer.
   * @param {Object} [options={}] - Opciones adicionales para la consulta.
   * @returns {Promise<Array>} Lista de historiales relacionados a la venta.
   */
  async findAllByVenta(id_venta_chofer, options = {}) {
    return await HistorialVentasChofer.findAll({
      where: { id_venta_chofer },
      ...options,
    });
  }

  /**
   * Actualizar un historial.
   * @param {number} id - El ID del historial a actualizar.
   * @param {Object} updates - Los datos para actualizar.
   * @param {Object} [options={}] - Opciones adicionales para la transacción.
   * @returns {Promise<number>} El número de filas afectadas.
   */
  async update(id, updates, options = {}) {
    return await HistorialVentasChofer.update(updates, {
      where: { id_historial: id },
      ...options,
    });
  }

  /**
   * Eliminar un historial por ID.
   * @param {number} id - El ID del historial a eliminar.
   * @param {Object} [options={}] - Opciones adicionales para la transacción.
   * @returns {Promise<number>} El número de filas eliminadas.
   */
  async delete(id, options = {}) {
    return await HistorialVentasChofer.destroy({
      where: { id_historial: id },
      ...options,
    });
  }
}

export default new HistorialVentasChoferRepository();

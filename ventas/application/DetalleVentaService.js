import DetalleVentaRepository from "../infrastructure/repositories/DetalleVentaRepository.js";
import VentaRepository from "../infrastructure/repositories/VentaRepository.js";

class DetalleVentaService {
  /**
   * Obtiene los detalles de una venta por ID de venta.
   * @param {number} id_venta - ID de la venta
   * @returns {Promise<Array>} Lista de detalles de la venta
   */
  async getDetallesPorVenta(id_venta) {
    try {
      if (!id_venta) {
        throw new Error("El ID de la venta es obligatorio.");
      }

      const detalles = await DetalleVentaRepository.findByVentaId(id_venta);
      if (!detalles || detalles.length === 0) {
        throw new Error("No se encontraron detalles para esta venta.");
      }

      return detalles;
    } catch (error) {
      throw new Error(`Error al obtener los detalles de la venta: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo detalle de venta.
   * @param {Object} data - Datos del detalle de venta
   * @returns {Promise<Object>} Detalle de venta creado
   */
  async crearDetalleVenta(data) {
    try {
      if (!data || !data.id_venta || !data.id_producto || !data.cantidad || !data.precio_unitario) {
        throw new Error("Faltan datos obligatorios para crear el detalle de venta.");
      }

      const ventaExiste = await VentaRepository.findById(data.id_venta);
      if (!ventaExiste) {
        throw new Error(`No se encontró una venta con ID ${data.id_venta}.`);
      }

      const nuevoDetalle = await DetalleVentaRepository.create(data);
      return nuevoDetalle;
    } catch (error) {
      throw new Error(`Error al crear el detalle de venta: ${error.message}`);
    }
  }

  /**
   * Actualiza un detalle de venta por ID.
   * @param {number} id_detalle - ID del detalle de venta
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object|null>} Detalle de venta actualizado o null si no existe
   */
  async actualizarDetalleVenta(id_detalle, updates) {
    try {
      if (!id_detalle || !updates) {
        throw new Error("El ID del detalle y los datos a actualizar son obligatorios.");
      }

      const detalleActualizado = await DetalleVentaRepository.update(id_detalle, updates);
      if (!detalleActualizado) {
        throw new Error(`No se encontró un detalle de venta con ID ${id_detalle}.`);
      }

      return detalleActualizado;
    } catch (error) {
      throw new Error(`Error al actualizar el detalle de venta: ${error.message}`);
    }
  }

  /**
   * Elimina un detalle de venta por ID.
   * @param {number} id_detalle - ID del detalle de venta
   * @returns {Promise<boolean>} True si se eliminó, False si no existía
   */
  async eliminarDetalleVenta(id_detalle) {
    try {
      if (!id_detalle) {
        throw new Error("El ID del detalle de venta es obligatorio.");
      }

      const eliminado = await DetalleVentaRepository.delete(id_detalle);
      if (!eliminado) {
        throw new Error(`No se encontró un detalle de venta con ID ${id_detalle}.`);
      }

      return true;
    } catch (error) {
      throw new Error(`Error al eliminar el detalle de venta: ${error.message}`);
    }
  }
}

export default new DetalleVentaService();

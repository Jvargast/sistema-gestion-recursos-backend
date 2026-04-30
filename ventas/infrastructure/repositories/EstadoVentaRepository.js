import EstadoVenta from "../../domain/models/EstadoVenta.js";

class EstadoVentaRepository {
  async findById(id, options = {}) {
    try {
      return await EstadoVenta.findByPk(id, options);
    } catch (error) {
      console.error("Error en EstadoVentaRepository.findById:", error.message);
      throw error;
    }
  }

  async findByNombre(nombre, options = {}) {
    try {
      return await EstadoVenta.findOne({
        where: { nombre_estado: nombre },
        ...options,
      });
    } catch (error) {
      console.error("Error en EstadoVentaRepository.findByNombre:", error.message);
      throw error;
    }
  }

  async findAll() {
    try {
      return await EstadoVenta.findAll();
    } catch (error) {
      console.error("Error en EstadoVentaRepository.findAll:", error.message);
      throw error;
    }
  }

  async create(data, options = {}) {
    return await EstadoVenta.create(data, options);
  }

  async update(id, updates, options = {}) {
    const [updated] = await EstadoVenta.update(updates, {
      where: { id_estado_venta: id },
      ...options,
    });
    return updated > 0 ? await this.findById(id, options) : null;
  }

  async delete(id) {
    return await EstadoVenta.destroy({ where: { id_estado_venta: id } });
  }

  getModel() {
    return EstadoVenta;
  }
}

export default new EstadoVentaRepository();

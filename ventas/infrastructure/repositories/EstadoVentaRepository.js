import EstadoVenta from "../../domain/models/EstadoVenta.js";

class EstadoVentaRepository {
  async findById(id) {
    try {
      return await EstadoVenta.findByPk(id);
    } catch (error) {
      console.error("Error en EstadoVentaRepository.findById:", error.message);
      throw error;
    }
  }

  async findByNombre(nombre) {
    try {
      return await EstadoVenta.findOne({ where: { nombre_estado: nombre } });
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

  async create(data) {
    return await EstadoVenta.create(data);
  }

  async update(id, updates) {
    const [updated] = await EstadoVenta.update(updates, {
      where: { id_estado_venta: id },
    });
    return updated > 0 ? await this.findById(id) : null;
  }

  async delete(id) {
    return await EstadoVenta.destroy({ where: { id_estado_venta: id } });
  }

  getModel() {
    return EstadoVenta;
  }
}

export default new EstadoVentaRepository();

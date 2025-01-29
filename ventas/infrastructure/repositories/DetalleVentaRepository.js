import DetalleVenta from "../../domain/models/DetalleVenta.js";
import Venta from "../../domain/models/Venta.js";

class DetalleVentaRepository {
    async findByVentaId(id_venta) {
      return await DetalleVenta.findAll({
        where: { id_venta },
        include: [{ model: Venta, as: "venta" }],
      });
    }
  
    async create(data) {
      return await DetalleVenta.create(data);
    }
  
    async update(id, updates) {
      const [updated] = await DetalleVenta.update(updates, {
        where: { id_detalle: id },
      });
      return updated > 0 ? await DetalleVenta.findByPk(id) : null;
    }
  
    async delete(id) {
      return await DetalleVenta.destroy({ where: { id_detalle: id } });
    }
  
    getModel() {
      return DetalleVenta;
    }
  }
  
  export default new DetalleVentaRepository();
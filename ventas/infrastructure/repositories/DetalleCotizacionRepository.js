import Producto from "../../../inventario/domain/models/Producto.js";
import Cotizacion from "../../domain/models/Cotizacion.js";
import DetalleCotizacion from "../../domain/models/DetalleCotizacion.js";

class DetalleCotizacionRepository {
  async findByCotizacionId(id_cotizacion) {
    return await DetalleCotizacion.findAll({
      where: { id_cotizacion },
      include: [
        { model: Cotizacion, as: "cotizacion" },
        { model: Producto, as: "producto" },
      ],
    });
  }

  async create(data) {
    return await DetalleCotizacion.create(data);
  }

  async update(id, updates) {
    const [updated] = await DetalleCotizacion.update(updates, {
      where: { id_detalle: id },
    });
    return updated > 0 ? await DetalleCotizacion.findByPk(id) : null;
  }

  async delete(id) {
    return await DetalleCotizacion.destroy({ where: { id_detalle: id } });
  }

  getModel() {
    return DetalleCotizacion;
  }
}

export default new DetalleCotizacionRepository();

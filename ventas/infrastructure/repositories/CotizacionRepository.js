import Empresa from "../../../auth/domain/models/Empresa.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Cliente from "../../domain/models/Cliente.js";
import Cotizacion from "../../domain/models/Cotizacion.js";
import DetalleCotizacion from "../../domain/models/DetalleCotizacion.js";

class CotizacionRepository {
  async findById(id) {
    try {
      return await Cotizacion.findByPk(id, {
        include: [
          { model: DetalleCotizacion, as: "detallesCotizacion" },
          { model: Cliente, as: "cliente" },
          {
            model: Usuarios,
            as: "vendedor",
            include: [
              {
                model: Empresa,
                as: "Empresa",
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error en CotizacionRepository.findById:", error.message);
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    const limit = options.limit || null;
    const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;

    return await Cotizacion.findAndCountAll({
      where: filters,
      limit,
      offset,
      include: [
        { model: DetalleCotizacion, as: "detalles" },
        { model: Cliente, as: "cliente" },
      ],
    });
  }

  async create(data) {
    return await Cotizacion.create(data);
  }

  async update(id, updates) {
    const [updated] = await Cotizacion.update(updates, {
      where: { id_cotizacion: id },
    });
    return updated > 0 ? await this.findById(id) : null;
  }

  async delete(id) {
    return await Cotizacion.destroy({ where: { id_cotizacion: id } });
  }

  getModel() {
    return Cotizacion;
  }
}

export default new CotizacionRepository();

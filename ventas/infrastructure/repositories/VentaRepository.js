import Sucursal from "../../../auth/domain/models/Sucursal.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Caja from "../../domain/models/Caja.js";
import Cliente from "../../domain/models/Cliente.js";
import DetalleVenta from "../../domain/models/DetalleVenta.js";
import Documento from "../../domain/models/Documento.js";
import Venta from "../../domain/models/Venta.js";

class VentaRepository {
  async findById(id) {
    try {
      return await Venta.findByPk(id, {
        include: [
          { model: DetalleVenta, as: "detallesVenta" },
          { model: Cliente, as: "cliente" },
          { model: Usuarios, as: "vendedor" },
          { model: Caja, as: "caja" },
          { model: Sucursal, as: "sucursal" },
        ],
      });
    } catch (error) {
      console.error("Error en VentaRepository.findById:", error.message);
      throw error;
    }
  }

  async findByPedidoId(id_pedido, options = {}) {
    return await Venta.findOne({
      where: { id_pedido },
      include: [{ model: Documento, as: "documento" }],
      ...options,
    });
  }

  async findAll(filters = {}, options = {}) {
    const limit = options.limit || null;
    const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;

    return await Venta.findAndCountAll({
      where: filters,
      limit,
      offset,
      include: [
        { model: DetalleVenta, as: "detalles" },
        { model: Cliente, as: "cliente" },
      ],
    });
  }

  async create(data) {
    return await Venta.create(data);
  }

  async update(id, updates) {
    const [updated] = await Venta.update(updates, {
      where: { id_venta: id },
    });
    return updated > 0 ? await this.findById(id) : null;
  }

  async updateDesdeAnulacion(id, updates, options = {}) {
    const [updated] = await Venta.update(updates, {
      where: { id_venta: id },
      ...options, 
    });
    return updated > 0 ? await this.findById(id, options) : null;
  }

  async delete(id) {
    return await Venta.destroy({ where: { id_venta: id } });
  }

  getModel() {
    return Venta;
  }
}

export default new VentaRepository();

import Factura from "../../domain/models/Factura.js";
import Documento from "../../domain/models/Documento.js";
import Cliente from "../../domain/models/Cliente.js";
import EstadoPago from "../../domain/models/EstadoPago.js";
import Transaccion from "../../domain/models/Transaccion.js";
import DetalleTransaccion from "../../domain/models/DetalleTransaccion.js";
import Producto from "../../../inventario/domain/models/Producto.js";

class FacturaRepository {
  async findById(id) {
    try {
      return await Factura.findByPk(id, {
        include: [
          {
            model: Documento,
            as: "documento",
            include: [
              { model: Cliente, as: "cliente" },
              { model: EstadoPago, as: "estadoPago" },
              {
                model: Transaccion,
                as: "transaccion",
                include: [
                  {
                    model: DetalleTransaccion,
                    as: "detalles",
                    include: [{ model: Producto, as: "producto" }],
                  },
                ],
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error en FacturaRepository.findById:", error.message);
      throw error;
    }
  }
  async findLastFactura() {
    try {
      return await Factura.findOne({
        order: [["id_factura", "DESC"]], // Ordenar por ID descendente
      });
    } catch (error) {
      throw new Error(`Error al obtener la última factura: ${error.message}`);
    }
  }

  async findAll(filters, options) {
    return await Factura.findAndCountAll({
      where: filters,
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
      include: [{ model: Documento, as: "documento" }],
    });
  }

  async create(data) {
    return await Factura.create(data, {
      include: [{ model: Documento, as: "documento" }],
    });
  }

  async update(id, updates) {
    const [updated] = await Factura.update(updates, {
      where: { id_factura: id },
    });
    return updated > 0 ? await this.findById(id) : null;
  }

  async findByIds(ids) {
    return await Factura.findAll({
      where: { id_factura: ids },
      include: [{ model: Documento, as: "documento" }],
    });
  }

  getModel() {
    return Factura;
  }
}

export default new FacturaRepository();

import Producto from "../../../inventario/domain/models/Producto.js";
import Cliente from "../../domain/models/Cliente.js";
import CuentaPorCobrar from "../../domain/models/CuentaPorCobrar.js";
import DetalleVenta from "../../domain/models/DetalleVenta.js";
import Documento from "../../domain/models/Documento.js";
import Venta from "../../domain/models/Venta.js";

class CuentaPorCobrarRepository {
  async create(data, options = {}) {
    return await CuentaPorCobrar.create(data, options);
  }
  async getAllWithDocumentos() {
    return await CuentaPorCobrar.findAll({
      include: [
        {
          model: Documento,
          as: "documento",
          where: { tipo_documento: "factura" },
        },
      ],
      order: [["fecha_emision", "DESC"]],
    });
  }
  async findById(id) {
    return await CuentaPorCobrar.findOne({
      where: { id_cxc: id },
      include: [
        {
          model: Venta,
          as: "venta",
          include: [
            {
              model: Cliente,
              as: "cliente",
              attributes: [
                "id_cliente",
                "nombre",
                "rut",
                "email",
                "razon_social",
              ],
            },
            {
              model: DetalleVenta,
              as: "detallesVenta",
              include: [
                {
                  model: Producto,
                  as: "producto",
                },
              ],
            },
          ],
        },
        {
          model: Documento,
          as: "documento",
        },
      ],
    });
  }
  async findByIdVenta(idVenta, options = {}) {
    return CuentaPorCobrar.findOne({
      where: { id_venta: idVenta },
      ...options,
    });
  }

  async findFacturaByIdVenta(idVenta, options = {}) {
    return CuentaPorCobrar.findOne({
      where: { id_venta: idVenta },
      ...options,
    });
  }
  async findByIdDocumento(idDocumento, options = {}) {
    return CuentaPorCobrar.findOne({
      where: { id_documento: idDocumento },
      ...options,
    });
  }

  async update(id_cxc, values, options = {}) {
    const [affectedRows] = await CuentaPorCobrar.update(values, {
      where: { id_cxc },
      ...options,
    });

    if (affectedRows === 0) return null;

    return CuentaPorCobrar.findByPk(id_cxc, options);
  }

  getModel() {
    return CuentaPorCobrar;
  }
}

export default new CuentaPorCobrarRepository();

import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Cliente from "../../domain/models/Cliente.js";
import DetallePedido from "../../domain/models/DetallePedido.js";
import EstadoVenta from "../../domain/models/EstadoVenta.js";
import MetodoPago from "../../domain/models/MetodoPago.js";
import Pedido from "../../domain/models/Pedido.js";

class PedidoRepository {
  async findById(id_pedido) {
    return await Pedido.findByPk(id_pedido, {
      include: [
        { model: Cliente, as: "Cliente", attributes: ["nombre", "apellido"] },
        {
          model: Usuarios,
          as: "Chofer",
          attributes: ["rut", "nombre", "apellido"],
        },
        { model: Usuarios, as: "Creador", attributes: ["rut", "nombre"] },
        { model: MetodoPago, as: "MetodoPago", attributes: ["nombre"] },
        {
          model: EstadoVenta,
          as: "EstadoPedido",
          attributes: ["nombre_estado"],
        },
        {
          model: DetallePedido,
          as: "DetallesPedido",
          attributes: [
            "cantidad",
            "precio_unitario",
            "subtotal",
            "id_detalle_pedido",
          ],
          include: [
            {
              model: Producto,
              as: "Producto",
              attributes: [
                "nombre_producto",
                "precio",
                "codigo_barra",
                "image_url",
              ],
            },
            {
              model: Insumo,
              as: "Insumo",
              attributes: ["nombre_insumo", "precio"],
            },
          ],
        },
      ],
    });
  }

  async findByIdVenta(idVenta) {
    return await Pedido.findOne({
      where: { id_venta: idVenta },
    });
  }

  async findAll() {
    return await Pedido.findAll({
      include: [
        { model: Cliente, as: "Cliente" },
        { model: Usuarios, as: "Chofer" },
        { model: Usuarios, as: "Creador" },
        { model: MetodoPago, as: "MetodoPago" },
        { model: EstadoVenta, as: "EstadoPedido" },
        {
          model: DetallePedido,
          as: "DetallesPedido",
          include: [{ model: Producto, as: "Producto" }],
        },
      ],
    });
  }

  async findAllByChoferAndEstado(id_chofer, id_estado_pedido) {
    return await Pedido.findAll({
      where: {
        id_chofer,
        id_estado_pedido,
      },
    });
  }

  async create(data) {
    return await Pedido.create(data);
  }

  async update(id, updates) {
    const [updated] = await Pedido.update(updates, {
      where: { id_pedido: id },
    });
    return updated > 0 ? await Pedido.findByPk(id) : null;
  }

  async updateFromVenta(id, updates, options = {}) {
    const [updated] = await Pedido.update(updates, {
      where: { id_pedido: id },
      ...options,
    });
    return updated > 0 ? await Pedido.findByPk(id) : null;
  }

  async delete(id) {
    return await Pedido.destroy({ where: { id_pedido: id } });
  }

  getModel() {
    return Pedido;
  }
}

export default new PedidoRepository();

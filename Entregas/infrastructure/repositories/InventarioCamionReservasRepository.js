import Producto from "../../../inventario/domain/models/Producto.js";
import Pedido from "../../../ventas/domain/models/Pedido.js";
import InventarioCamion from "../../domain/models/InventarioCamion.js";
import InventarioCamionReservas from "../../domain/models/InventarioCamionReservas.js";


class InventarioCamionReservasRepository {
  /**
   * 📌 Crea una nueva reserva de productos en el inventario del camión
   */
  async create(data) {
    return await InventarioCamionReservas.create(data);
  }

  /**
   * 📌 Encuentra una reserva específica por su ID
   */
  async findById(id) {
    return await InventarioCamionReservas.findByPk(id, {
      include: [
        {
          model: InventarioCamion,
          as: "inventario_camion",
          include: [{ model: Producto, as: "producto" }],
        },
        {
          model: Pedido,
          as: "pedido",
          attributes: ["id_pedido", "id_cliente", "direccion_entrega"],
        },
      ],
    });
  }

  /**
   * 📌 Busca todas las reservas activas para un camión específico
   */
  async findReservasByCamion(id_camion) {
    return await InventarioCamionReservas.findAll({
      where: { id_camion },
      include: [
        {
          model: InventarioCamion,
          as: "inventario_camion",
          include: [{ model: Producto, as: "producto" }],
        },
        {
          model: Pedido,
          as: "pedido",
          attributes: ["id_pedido", "id_cliente"],
        },
      ],
    });
  }

  /**
   * 📌 Busca todas las reservas activas de un pedido en particular
   */
  async findReservasByPedido(id_pedido) {
    return await InventarioCamionReservas.findAll({
      where: { id_pedido },
      include: [
        {
          model: InventarioCamion,
          as: "inventario_camion",
          include: [{ model: Producto, as: "producto" }],
        },
      ],
    });
  }

  /**
   * 📌 Encuentra todas las reservas de un chofer en tránsito
   */
  async findReservasByChofer(id_chofer) {
    return await InventarioCamionReservas.findAll({
      where: {
        estado: "Pendiente",
      },
      include: [
        {
          model: InventarioCamion,
          as: "inventario_camion",
          where: { id_chofer },
          include: [{ model: Producto, as: "producto" }],
        },
        {
          model: Pedido,
          as: "pedido",
          attributes: ["id_pedido", "id_cliente"],
        },
      ],
    });
  }

  /**
   * 📌 Actualiza una reserva específica
   */
  async update(id, data, transaction = null) {
    return await InventarioCamionReservas.update(data, {
      where: { id },
      transaction,
    });
  }

  /**
   * 📌 Elimina una reserva por su ID
   */
  async delete(id, transaction = null) {
    return await InventarioCamionReservas.destroy({
      where: { id },
      transaction,
    });
  }

  /**
   * 📌 Elimina todas las reservas de un pedido (Ejemplo: Si el chofer cancela)
   */
  async deleteByPedido(id_pedido, transaction = null) {
    return await InventarioCamionReservas.destroy({
      where: { id_pedido },
      transaction,
    });
  }

  /**
   * 📌 Verifica si un producto ya está reservado en el camión
   */
  async isProductReserved(id_camion, id_producto) {
    const reserva = await InventarioCamionReservas.findOne({
      where: {
        id_camion,
        id_producto,
        estado: "Pendiente",
      },
    });

    return reserva ? true : false;
  }
  getModel(){
    return InventarioCamionReservas;
  }
}

export default new InventarioCamionReservasRepository();

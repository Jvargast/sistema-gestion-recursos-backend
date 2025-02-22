import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import sequelize from "../../database/database.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import DetallePedidoRepository from "../infrastructure/repositories/DetallePedidoRepository.js";
import EstadoVentaRepository from "../infrastructure/repositories/EstadoVentaRepository.js";
import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";
import PedidoRepository from "../infrastructure/repositories/PedidoRepository.js";


class PedidoService {

  async createPedido(data) {
    const transaction = await sequelize.transaction();
    try {
      const { id_cliente, id_creador, id_chofer, direccion_entrega, metodo_pago, productos } = data;

      // 🔹 1. Validar o crear cliente
      let cliente = await ClienteRepository.findById(id_cliente);
      if (!cliente) {
        cliente = await ClienteRepository.create({ id_cliente, ...data.cliente });
      }

      // 🔹 2. Validar usuario creador y chofer
      const creador = await UsuariosRepository.findById(id_creador);
      if (!creador) throw new Error("Usuario creador no encontrado.");

      let chofer = null;
      if (id_chofer) {
        chofer = await UsuariosRepository.findById(id_chofer);
        if (!chofer) throw new Error("Chofer asignado no encontrado.");
      }

      // 🔹 3. Verificar el método de pago
      let metodoPago = null;
      if (metodo_pago) {
        metodoPago = await MetodoPagoRepository.findById(metodo_pago);
        if (!metodoPago) throw new Error("Método de pago inválido.");
      }

      // 🔹 4. Estado inicial del pedido
      const estadoPedido = await EstadoVentaRepository.findByNombre("Pendiente");
      if (!estadoPedido) throw new Error("Estado inicial no encontrado.");

      // 🔹 5. Crear el pedido
      const nuevoPedido = await PedidoRepository.create(
        {
          id_cliente: cliente.id_cliente,
          id_creador,
          id_chofer: chofer ? chofer.id_usuario : null,
          direccion_entrega,
          id_metodo_pago: metodoPago ? metodoPago.id_metodo_pago : null,
          id_estado_pedido: estadoPedido.id_estado_venta,
          total: 0, // Se calculará después
        },
        { transaction }
      );

      let totalPedido = 0;

      // 🔹 6. Agregar productos al pedido
      for (const item of productos) {
        const producto = await ProductosRepository.findById(item.id_producto);
        if (!producto) throw new Error(`Producto con ID ${item.id_producto} no encontrado.`);

        const subtotal = producto.precio * item.cantidad;
        totalPedido += subtotal;

        await DetallePedidoRepository.create(
          {
            id_pedido: nuevoPedido.id_pedido,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: producto.precio,
            subtotal,
          },
          { transaction }
        );
      }

      // 🔹 7. Actualizar total del pedido
      await PedidoRepository.update(nuevoPedido.id_pedido, { total: totalPedido }, { transaction });

      await transaction.commit();
      return await PedidoRepository.findById(nuevoPedido.id_pedido);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear pedido: ${error.message}`);
    }
  }


  async updateEstadoPedido(id_pedido, nuevoEstado) {
    const estadoPedido = await EstadoVentaRepository.findByNombre(nuevoEstado);
    if (!estadoPedido) throw new Error("Estado de pedido inválido.");

    await PedidoRepository.update(id_pedido, { id_estado_pedido: estadoPedido.id_estado_venta });
    return await PedidoRepository.findById(id_pedido);
  }


  async asignarPedidoAChofer(id_pedido, id_chofer) {
    const chofer = await UsuariosRepository.findById(id_chofer);
    if (!chofer) throw new Error("Chofer no encontrado.");

    await PedidoRepository.update(id_pedido, { id_chofer });
    return await PedidoRepository.findById(id_pedido);
  }


  async getPedidoById(id_pedido) {
    return await PedidoRepository.findById(id_pedido);
  }

  /**
   * Obtiene todos los pedidos
   */
  async getAllPedidos() {
    return await PedidoRepository.findAll();
  }


  async deletePedido(id_pedido) {
    await DetallePedidoRepository.deleteByPedidoId(id_pedido);
    return await PedidoRepository.delete(id_pedido);
  }
}

export default new PedidoService();

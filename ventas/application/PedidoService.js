import { Op } from "sequelize";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import sequelize from "../../database/database.js";
import InventarioCamionService from "../../Entregas/application/InventarioCamionService.js";
import AgendaViajesRepository from "../../Entregas/infrastructure/repositories/AgendaViajesRepository.js";
import InventarioCamionReservasRepository from "../../Entregas/infrastructure/repositories/InventarioCamionReservasRepository.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import NotificacionService from "../../shared/services/NotificacionService.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import DetallePedidoRepository from "../infrastructure/repositories/DetallePedidoRepository.js";
import EstadoVentaRepository from "../infrastructure/repositories/EstadoVentaRepository.js";
import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";
import PedidoRepository from "../infrastructure/repositories/PedidoRepository.js";

class PedidoService {
  async createPedido(data) {
    const transaction = await sequelize.transaction();
    try {
      const {
        id_cliente,
        id_creador,
        id_chofer,
        direccion_entrega,
        metodo_pago,
        productos,
        notas,
      } = data;

      let cliente = await ClienteRepository.findById(id_cliente);
      if (!cliente) new Error("El cliente no existe.");

      const creador = await UsuariosRepository.findByRut(id_creador);
      if (!creador) throw new Error("Usuario creador no encontrado.");

      let chofer = null;
      if (id_chofer) {
        chofer = await UsuariosRepository.findByRut(id_chofer);
        if (!chofer) throw new Error("Chofer asignado no encontrado.");
      }

      let metodoPago = null;
      if (metodo_pago) {
        metodoPago = await MetodoPagoRepository.findById(metodo_pago);
        if (!metodoPago) throw new Error("Método de pago inválido.");
      }

      let estadoPedido = await EstadoVentaRepository.findByNombre(
        id_chofer ? "Pendiente de Confirmación" : "Pendiente"
      );
      if (!estadoPedido) throw new Error("Estado inicial no encontrado.");

      const nuevoPedido = await PedidoRepository.create(
        {
          id_cliente: cliente.id_cliente,
          id_creador,
          id_chofer: chofer ? chofer.rut : null,
          direccion_entrega,
          id_metodo_pago: metodoPago ? metodoPago.id_metodo_pago : null,
          id_estado_pedido: estadoPedido.id_estado_venta,
          notas: notas ? notas : null,
          total: 0,
        },
        { transaction }
      );

      let totalPedido = 0;

      let inventarioCamion = null;
      if (chofer) {
        const agendaViaje = await AgendaViajesRepository.findByChoferAndEstado(
          id_chofer,
          "En Tránsito"
        );
        if (agendaViaje) {
          inventarioCamion =
            await InventarioCamionService.getInventarioDisponible(
              agendaViaje.id_camion
            );
        }
      }

      for (const item of productos) {
        const producto = await ProductosRepository.findById(item.id_producto);
        if (!producto)
          throw new Error(`Producto con ID ${item.id_producto} no encontrado.`);

        const subtotal = producto.precio * item.cantidad;
        totalPedido += subtotal;

        if (inventarioCamion) {
          const productoDisponible = inventarioCamion.find(
            (p) => p.id_producto === item.id_producto
          );
          if (
            !productoDisponible ||
            productoDisponible.cantidad < item.cantidad
          ) {
            throw new Error(
              `El chofer no tiene suficiente stock de ${producto.nombre}`
            );
          }
          await InventarioCamionReservasRepository.create(
            {
              id_inventario_camion: productoDisponible.id_inventario_camion,
              id_pedido: nuevoPedido.id_pedido,
              cantidad_reservada: item.cantidad,
              estado: "Pendiente",
            },
            { transaction }
          );
        } else {
          await InventarioCamionReservasRepository.create(
            {
              id_inventario_camion: null,
              id_pedido: nuevoPedido.id_pedido,
              cantidad_reservada: item.cantidad,
              estado: "Pendiente",
            },
            { transaction }
          );
        }

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
      if (chofer) {
        await NotificacionService.enviarNotificacion({
          id_usuario: id_chofer,
          mensaje: `Nuevo pedido asignado: ID ${nuevoPedido.id_pedido}`,
          tipo: "pedido_asignado",
        });
      }

      await PedidoRepository.update(
        nuevoPedido.id_pedido,
        { total: totalPedido },
        { transaction }
      );

      await transaction.commit();
      return await PedidoRepository.findById(nuevoPedido.id_pedido);
    } catch (error) {
      if (transaction.finished !== "commit") {
        await transaction.rollback();
      }
      throw new Error(`Error al crear pedido: ${error.message}`);
    }
  }

  async confirmarPedido(id_pedido, id_chofer, estado) {
    const transaction = await sequelize.transaction();

    try {
      const pedido = await PedidoRepository.findById(id_pedido);
      if (!pedido) throw new Error("Pedido no encontrado.");
      if (pedido.id_chofer !== id_chofer)
        throw new Error("No tienes permisos para este pedido.");
      // Validar estado
      if (!["Aceptado", "Rechazado"].includes(estado)) {
        throw new Error("Estado inválido. Debe ser 'Aceptado' o 'Rechazado'.");
      }
      const nuevoEstado = await EstadoVentaRepository.findByNombre(
        estado === "Aceptado" ? "Confirmado" : "Rechazado"
      );
      await PedidoRepository.update(
        id_pedido,
        { id_estado_pedido: nuevoEstado.id_estado_venta },
        { transaction }
      );

      await PedidoRepository.update(
        id_pedido,
        { id_estado_pedido: nuevoEstado.id_estado_venta },
        { transaction }
      );

      if (estado === "Rechazado") {
        await PedidoRepository.update(
          id_pedido,
          { id_chofer: null },
          { transaction }
        );

        await NotificacionService.enviarNotificacion({
          id_usuario: pedido.id_creador,
          mensaje: `El pedido ID ${id_pedido} fue rechazado por el chofer.`,
          tipo: "pedido_rechazado",
        });

        await transaction.commit();
        return await PedidoRepository.findById(id_pedido);
      }
      // Verificar si el chofer está en ruta
      const agendaViaje = await AgendaViajesRepository.findByChoferAndEstado(
        id_chofer,
        "En Tránsito"
      );

      if (agendaViaje) {
        // Obtener inventario disponible del camión
        const inventarioCamion =
          await InventarioCamionService.getInventarioDisponible(
            agendaViaje.id_camion
          );

        for (const detalle of pedido.DetallesPedido) {
          const productoDisponible = inventarioCamion.find(
            (p) => p.id_producto === detalle.id_producto
          );

          if (
            !productoDisponible ||
            productoDisponible.cantidad < detalle.cantidad
          ) {
            throw new Error(
              `Stock insuficiente para el producto ${detalle.Producto.nombre_producto}.`
            );
          }

          await InventarioCamionService.actualizarProductoEnCamion(
            agendaViaje.id_camion,
            detalle.id_producto,
            -detalle.cantidad,
            "Reservado",
            { transaction }
          );
        }
      }

      await transaction.commit();
      return await PedidoRepository.findById(id_pedido);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al confirmar pedido: ${error.message}`);
    }
  }

  async getPedidosConfirmadosPorChofer(id_chofer) {
    if (!id_chofer) {
      throw new Error("Se requiere el ID del chofer.");
    }

    // 1️⃣ Obtener el estado "Confirmado"
    const estadoConfirmado = await EstadoVentaRepository.findByNombre(
      "Confirmado"
    );
    if (!estadoConfirmado) {
      throw new Error("No se encontró el estado 'Confirmado'.");
    }

    // 2️⃣ Buscar pedidos confirmados para el chofer
    const pedidos = await PedidoRepository.findAll({
      where: {
        id_chofer,
        id_estado_pedido: estadoConfirmado.id_estado_pedido,
      },
      include: [
        {
          model: DetallePedidoRepository.getModel(),
          as: "DetallesPedido",
          include: [
            {
              model: ProductosRepository.getModel(),
              as: "Producto",
              attributes: ["id_producto", "nombre_producto", "precio"],
            },
          ],
        },
        {
          model: ClienteRepository.getModel(),
          as: "Cliente",
          attributes: ["id_cliente", "nombre", "direccion"],
        },
      ],
      order: [["fecha_pedido", "ASC"]],
    });

    if (!pedidos || pedidos.length === 0) {
      return [];
    }

    // 3️⃣ Formatear respuesta
    return pedidos.map((pedido) => ({
      id_pedido: pedido.id_pedido,
      cliente: {
        id_cliente: pedido.Cliente?.id_cliente || null,
        nombre: pedido.Cliente?.nombre || "Sin nombre",
        direccion: pedido.Cliente?.direccion || "Sin dirección",
      },
      productos: pedido.DetallesPedido.map((detalle) => ({
        id_producto: detalle.Producto?.id_producto || null,
        nombre_producto: detalle.Producto?.nombre_producto || "Desconocido",
        cantidad: detalle.cantidad,
        precio_unitario: detalle.Producto?.precio || 0,
        subtotal: detalle.subtotal,
      })),
      fecha_pedido: pedido.fecha_pedido,
    }));
  }

  async updateEstadoPedido(id_pedido, nuevoEstado) {
    const estadoPedido = await EstadoVentaRepository.findByNombre(nuevoEstado);
    if (!estadoPedido) throw new Error("Estado de pedido inválido.");

    await PedidoRepository.update(id_pedido, {
      id_estado_pedido: estadoPedido.id_estado_venta,
    });
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
  async getPedidos(filters = {}, options = {}) {
    const allowedFields = [
      "id_cliente",
      "id_chofer",
      "id_estado_pedido",
      "direccion_entrega",
    ];

    const where = createFilter(filters, allowedFields);

    if (options.search) {
      where[Op.or] = [
        { "$Cliente.nombre$": { [Op.like]: `%${options.search}%` } },
        {
          "$EstadoPedido.nombre_estado$": { [Op.like]: `%${options.search}%` },
        },
        { direccion_entrega: { [Op.like]: `%${options.search}%` } },
      ];
    }

    if (filters.id_chofer === null) {
      where.id_chofer = { [Op.is]: null };
    }

    const include = [
      {
        model: ClienteRepository.getModel(),
        as: "Cliente",
        attributes: ["id_cliente", "nombre", "rut", "email"],
      },
      {
        model: UsuariosRepository.getModel(),
        as: "Chofer",
        attributes: ["rut", "nombre", "email"],
        required: false,
      },
      {
        model: EstadoVentaRepository.getModel(),
        as: "EstadoPedido",
        attributes: ["nombre_estado"],
      },
      {
        model: DetallePedidoRepository.getModel(),
        as: "DetallesPedido",
        include: [
          {
            model: ProductosRepository.getModel(),
            as: "Producto",
            attributes: ["id_producto", "nombre_producto", "precio"],
          },
        ],
      },
    ];

    const result = await paginate(PedidoRepository.getModel(), options, {
      where,
      include,
      order: [["fecha_pedido", "DESC"]],
    });

    return result;
  }

  async obtenerPedidosAsignados(id_chofer, options = {}) {
    return await this.getPedidos(
      { id_chofer: { [Op.eq]: id_chofer } },
      options
    );
  }

  async obtenerPedidosSinAsignar(options = {}) {
    return await this.getPedidos({ id_chofer: { [Op.is]: null } }, options);
  }

  async obtenerMisPedidos(id_chofer, options = {}) {
    return await this.getPedidos({ id_chofer }, options);
  }

  async deletePedido(id_pedido) {
    await DetallePedidoRepository.deleteByPedidoId(id_pedido);
    return await PedidoRepository.delete(id_pedido);
  }
}

export default new PedidoService();

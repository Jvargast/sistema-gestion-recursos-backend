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
import InventarioCamionRepository from "../../Entregas/infrastructure/repositories/InventarioCamionRepository.js";
import InsumoRepository from "../../inventario/infrastructure/repositories/InsumoRepository.js";

class PedidoService {
  async createPedido(data) {
    const transaction = await sequelize.transaction();
    try {
      const {
        id_cliente,
        id_creador,
        direccion_entrega,
        metodo_pago,
        productos,
        notas,
        pagado,
      } = data;

      let cliente = await ClienteRepository.findById(id_cliente);
      if (!cliente) new Error("El cliente no existe.");

      const creador = await UsuariosRepository.findByRut(id_creador);
      if (!creador) throw new Error("Usuario creador no encontrado.");

      let metodoPago = null;
      if (metodo_pago) {
        metodoPago = await MetodoPagoRepository.findById(metodo_pago);
        if (!metodoPago) throw new Error("Método de pago inválido.");
      }

      const estadoInicial = await EstadoVentaRepository.findByNombre(
        "Pendiente"
      );
      if (!estadoInicial) throw new Error("Estado inicial no configurado.");

      const nuevoPedido = await PedidoRepository.create(
        {
          id_cliente: cliente.id_cliente,
          id_creador,
          direccion_entrega,
          id_metodo_pago: metodoPago ? metodoPago.id_metodo_pago : null,
          id_estado_pedido: estadoInicial.id_estado_venta,
          notas: notas ? notas : null,
          total: 0,
          estado_pago: pagado ? "Pagado" : "Pendiente",
        },
        { transaction }
      );

      let totalPedido = 0;

      for (const item of productos) {
        if (item.tipo === "producto") {
          const producto = await ProductosRepository.findById(item.id_producto);
          if (!producto)
            throw new Error(`Producto no encontrado ID ${item.id_producto}`);
          totalPedido += producto.precio * item.cantidad;

          await DetallePedidoRepository.create(
            {
              id_pedido: nuevoPedido.id_pedido,
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              precio_unitario: producto.precio,
              subtotal: producto.precio * item.cantidad,
              tipo: "producto",
            },
            { transaction }
          );
        } else if (item.tipo === "insumo") {
          const insumo = await InsumoRepository.findById(item.id_insumo);
          if (!insumo || !insumo.es_para_venta)
            throw new Error(
              `Insumo ${item.id_insumo} no válido o no vendible.`
            );
          totalPedido += insumo.precio * item.cantidad;

          await DetallePedidoRepository.create(
            {
              id_pedido: nuevoPedido.id_pedido,
              id_insumo: item.id_insumo,
              cantidad: item.cantidad,
              precio_unitario: insumo.precio,
              subtotal: insumo.precio * item.cantidad,
            },
            { transaction }
          );
        }
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

  async asignarPedido(id_pedido, id_chofer) {
    try {
      const pedido = await PedidoRepository.findById(id_pedido);
      if (!pedido) throw new Error("Pedido no encontrado.");

      const chofer = await UsuariosRepository.findByRut(id_chofer);
      if (!chofer) throw new Error("Chofer no encontrado.");

      const estado = await EstadoVentaRepository.findByNombre(
        "Pendiente Confirmación Chofer"
      );
      if (!estado)
        throw new Error("Estado Pendiente Confirmación no configurado.");

      await PedidoRepository.update(id_pedido, {
        id_chofer,
        id_estado_pedido: estado.id_estado_venta,
      });

      await NotificacionService.enviarNotificacion({
        id_usuario: id_chofer,
        mensaje: `Nuevo pedido asignado: ID ${id_pedido}`,
        tipo: "pedido_asignado",
      });

      return PedidoRepository.findById(id_pedido);
    } catch (error) {
      throw new Error(`Error al asignar pedido: ${error.message}`);
    }
  }

  async confirmarPedidoChofer(id_pedido, id_chofer) {
    const transaction = await sequelize.transaction();
    try {
      const pedido = await PedidoRepository.findById(id_pedido);
      if (!pedido || pedido.id_chofer !== id_chofer)
        throw new Error('Pedido no asignado a este chofer.');
  
      const detallesPedido = await DetallePedidoRepository.findByPedidoId(id_pedido);

      const detallesPedidoProductos = detallesPedido.filter(async item => {
        const producto = await ProductosRepository.findById(item.id_producto);
        return producto; // solo productos, no insumos
      });

      const viajeActivo = await AgendaViajesRepository.findByChoferAndEstado(id_chofer, 'En Tránsito');
  
      let nuevoEstado;
      if (viajeActivo) {
        const inventarioDisponible = await InventarioCamionService.getInventarioDisponible(viajeActivo.id_camion);
  
        for (const item of detallesPedidoProductos) {
          const producto = await ProductosRepository.findById(item.id_producto);
          const esRetornable = producto.es_retornable;
  
          const disponibleEnCamion = inventarioDisponible.find(inv => inv.id_producto === item.id_producto);
  
          if (!disponibleEnCamion || disponibleEnCamion.cantidad < item.cantidad) {
            nuevoEstado = await EstadoVentaRepository.findByNombre('Pendiente Asignación');
            throw new Error(`Stock insuficiente para producto ${producto.nombre_producto}`);
          }
  
          await InventarioCamionReservasRepository.create({
            id_inventario_camion: disponibleEnCamion.id_inventario_camion,
            id_pedido,
            cantidad_reservada: item.cantidad,
            estado: 'Pendiente',
            tipo: esRetornable ? 'producto_retornable' : 'producto_no_retornable',
          }, { transaction });
  
          // Actualizar InventarioCamion restando la cantidad reservada
          await InventarioCamionRepository.update(disponibleEnCamion.id_inventario_camion, {
            cantidad: disponibleEnCamion.cantidad - item.cantidad,
            estado: 'En Camión - Reservado',
            fecha_actualizacion: new Date()
          }, { transaction });
        }
        nuevoEstado = await EstadoVentaRepository.findByNombre('Confirmado');
      } else {
        // Si no hay viaje activo, no reservas inmediatamente
        nuevoEstado = await EstadoVentaRepository.findByNombre('Confirmado');
      }
  
      await PedidoRepository.update(id_pedido, {
        id_estado_pedido: nuevoEstado.id_estado_venta,
      }, { transaction });
  
      await NotificacionService.enviarNotificacion({
        id_usuario: id_chofer,
        mensaje: `Pedido ${id_pedido} confirmado correctamente.`,
        tipo: 'pedido_confirmado',
      });
  
      await transaction.commit();
      return PedidoRepository.findById(id_pedido);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al confirmar pedido: ${error.message}`);
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

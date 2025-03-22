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
import VentaService from "./VentaService.js";

class PedidoService {
  // Se crea en Pendiente
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
      if (!cliente) throw new Error("El cliente no existe.");

      const creador = await UsuariosRepository.findByRut(id_creador);
      if (!creador) throw new Error("Usuario creador no encontrado.");

      let metodoPago = null;
      if (metodo_pago) {
        metodoPago = await MetodoPagoRepository.findById(metodo_pago);
        if (!metodoPago) throw new Error("Método de pago inválido.");
      } // Ensure this closing brace matches the corresponding opening brace

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

      let ventaRegistrada = null;

      if (pagado) {
        ventaRegistrada = await VentaService.createVenta(
          {
            id_cliente,
            id_vendedor: id_creador,
            id_caja,
            tipo_entrega: "pedido_pagado_anticipado",
            direccion_entrega,
            productos,
            productos_retornables: [],
            id_metodo_pago: metodo_pago,
            notas,
            impuesto: 0,
            tipo_documento,
            pago_recibido,
            referencia,
            id_pedido_asociado: nuevoPedido.id_pedido,
          },
          id_creador, // usuario que crea el pedido
          transaction
        );

        // Actualizar el pedido asociándolo a la venta creada
        await PedidoRepository.update(
          nuevoPedido.id_pedido,
          {
            id_venta: ventaRegistrada.venta.id_venta,
            id_estado_pedido: estadoInicial.id_estado_venta, // Puede ser otro estado según lógica de negocio.
            estado_pago: "Pagado",
          },
          { transaction }
        );
      }

      await transaction.commit();
      return await PedidoRepository.findById(nuevoPedido.id_pedido);
    } catch (error) {
      if (transaction.finished !== "commit") {
        await transaction.rollback();
      }
      throw new Error(`Error al crear pedido: ${error.message}`);
    }
  }
  // Asignar de Pendiente -> Pendiente de Confirmación
  async asignarPedido(id_pedido, id_chofer) {
    try {
      const pedido = await PedidoRepository.findById(id_pedido);
      if (!pedido) throw new Error("Pedido no encontrado.");

      const chofer = await UsuariosRepository.findByRut(id_chofer);
      if (!chofer) throw new Error("Chofer no encontrado.");

      // Estado actual debe ser "Pendiente" para asignar correctamente
      const estadoPendiente = await EstadoVentaRepository.findByNombre(
        "Pendiente"
      );
      if (!estadoPendiente) throw new Error("Estado Pendiente no configurado.");
      if (pedido.id_estado_pedido !== estadoPendiente.id_estado_venta) {
        throw new Error(
          "El pedido debe estar en estado 'Pendiente' para poder asignarse."
        );
      }

      const estadoPendienteConfirmacion =
        await EstadoVentaRepository.findByNombre("Pendiente de Confirmación");
      if (!estadoPendienteConfirmacion)
        throw new Error("Estado 'Pendiente de Confirmación' no configurado.");

      await PedidoRepository.update(id_pedido, {
        id_chofer,
        id_estado_pedido: estadoPendienteConfirmacion.id_estado_venta,
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
  // Desasignar de Pendiente de Confirmación -> Pendiente
  async desasignarPedidoAChofer(id_pedido) {
    const transaction = await sequelize.transaction();
    try {
      const pedido = await PedidoRepository.findById(id_pedido, {
        transaction,
      });
      if (!pedido) throw new Error("Pedido no encontrado.");

      const estadoActual = await EstadoVentaRepository.findById(
        pedido.id_estado_pedido
      );
      const estadoPendienteConfirmacion =
        await EstadoVentaRepository.findByNombre("Pendiente de Confirmación");
      const estadoPendiente = await EstadoVentaRepository.findByNombre(
        "Pendiente"
      );

      if (!estadoPendienteConfirmacion || !estadoPendiente)
        throw new Error("Estados necesarios no configurados correctamente.");

      // Solo permitir desasignar si el pedido está en 'Pendiente de Confirmación'
      if (estadoActual.nombre_estado !== "Pendiente de Confirmación") {
        throw new Error(
          "Solo puedes desasignar pedidos en estado 'Pendiente de Confirmación'."
        );
      }
      await PedidoRepository.update(id_pedido, {
        id_chofer: null,
        id_estado_pedido: estadoPendiente.id_estado_venta,
      });

      await transaction.commit();
      return await PedidoRepository.findById(id_pedido);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al desasignar pedido: ${error.message}`);
    }
  }
  //Para a En Entrega o Confirmado
  async confirmarPedidoChofer(id_pedido, id_chofer) {
    const transaction = await sequelize.transaction();
    try {
      const pedido = await PedidoRepository.findById(id_pedido);
      if (!pedido || pedido.id_chofer !== id_chofer)
        throw new Error("Pedido no asignado a este chofer.");

      const detallesPedido = await DetallePedidoRepository.findByPedidoId(
        id_pedido
      );

      const detallesPedidoProductos = detallesPedido.filter(async (item) => {
        const producto = await ProductosRepository.findById(item.id_producto);
        return producto; // solo productos, no insumos
      });

      const viajeActivo = await AgendaViajesRepository.findByChoferAndEstado(
        id_chofer,
        "En Tránsito"
      );

      let nuevoEstado;
      if (viajeActivo) {
        const inventarioDisponible =
          await InventarioCamionService.getInventarioDisponible(
            viajeActivo.id_camion
          );

        for (const item of detallesPedidoProductos) {
          const producto = await ProductosRepository.findById(item.id_producto);
          const esRetornable = producto.es_retornable;

          const disponibleEnCamion = inventarioDisponible.find(
            (inv) => inv.id_producto === item.id_producto
          );

          if (
            !disponibleEnCamion ||
            disponibleEnCamion.cantidad < item.cantidad
          ) {
            nuevoEstado = await EstadoVentaRepository.findByNombre(
              "Pendiente Asignación"
            );
            throw new Error(
              `Stock insuficiente para producto ${producto.nombre_producto}`
            );
          }

          /* await InventarioCamionReservasRepository.create(
            {
              id_inventario_camion: disponibleEnCamion.id_inventario_camion,
              id_pedido,
              cantidad_reservada: item.cantidad,
              estado: "Pendiente",
              tipo: esRetornable
                ? "producto_retornable"
                : "producto_no_retornable",
            },
            { transaction }
          ); */

          // Actualizar InventarioCamion restando la cantidad reservada
          await InventarioCamionRepository.update(
            disponibleEnCamion.id_inventario_camion,
            {
              cantidad: disponibleEnCamion.cantidad - item.cantidad,
              estado: "En Camión - Reservado",
              fecha_actualizacion: new Date(),
              tipo: "Reservado",
              es_retornable: esRetornable
            },
            { transaction }
          );
        }
        nuevoEstado = await EstadoVentaRepository.findByNombre("En Entrega");
        
      } else {
        // Si no hay viaje activo, no reservas inmediatamente
        nuevoEstado = await EstadoVentaRepository.findByNombre("Confirmado");
      }

      await PedidoRepository.update(
        id_pedido,
        {
          id_estado_pedido: nuevoEstado.id_estado_venta,
        },
        { transaction }
      );
      const admin = UsuariosRepository.findByRol("administrador");

      await NotificacionService.enviarNotificacion({
        id_usuario: admin.rut,
        mensaje: `Pedido ${id_pedido} confirmado correctamente.`,
        tipo: "pedido_confirmado",
      });

      await transaction.commit();
      return PedidoRepository.findById(id_pedido);
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
    const pedidos = await PedidoRepository.getModel().findAll({
      where: {
        id_chofer,
        id_estado_pedido: estadoConfirmado.id_estado_venta,
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
    console.log(pedidos)

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

    if (options.fecha) {
      where.fecha_pedido = {
        [Op.between]: [
          `${options.fecha} 00:00:00`,
          `${options.fecha} 23:59:59`,
        ],
      };
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
            attributes: [
              "id_producto",
              "nombre_producto",
              "precio",
              "es_retornable",
            ],
          },
        ],
      },
    ];

    const result = await paginate(PedidoRepository.getModel(), options, {
      where,
      include,
      order: [["id_pedido", "DESC"]],
    });

    return result;
  }

  async obtenerHistorialPedidos(id_chofer, fecha, options = {}) {
    const where = {
      id_chofer: id_chofer,
      fecha_pedido: {
        [Op.between]: [`${fecha} 00:00:00`, `${fecha} 23:59:59`],
      }, // Rango de día completo
    };

    const include = [
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

    // 🔹 Corrección: nos aseguramos de usar "id_pedido" correctamente
    const result = await paginate(PedidoRepository.getModel(), options, {
      where,
      include,
      order: [["id_pedido", "DESC"]],
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





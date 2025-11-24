import { Op, Transaction } from "sequelize";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import sequelize from "../../database/database.js";
import InventarioCamionService from "../../Entregas/application/InventarioCamionService.js";
import AgendaViajesRepository from "../../Entregas/infrastructure/repositories/AgendaViajesRepository.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import NotificacionService from "../../shared/services/NotificacionService.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import DetallePedidoRepository from "../infrastructure/repositories/DetallePedidoRepository.js";
import EstadoVentaRepository from "../infrastructure/repositories/EstadoVentaRepository.js";
import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";
import PedidoRepository from "../infrastructure/repositories/PedidoRepository.js";
import InsumoRepository from "../../inventario/infrastructure/repositories/InsumoRepository.js";
import VentaService from "./VentaService.js";
import CajaRepository from "../infrastructure/repositories/CajaRepository.js";
import WebSocketServer from "../../shared/websockets/WebSocketServer.js";
import DocumentoRepository from "../infrastructure/repositories/DocumentoRepository.js";
import { obtenerFechaActualChile } from "../../shared/utils/fechaUtils.js";
import { estadosInvalidosPedido } from "../../shared/utils/estadoUtils.js";
import AgendaCargaRepository from "../../Entregas/infrastructure/repositories/AgendaCargaRepository.js";
import AgendaCargaDetalleRepository from "../../Entregas/infrastructure/repositories/AgendaCargaDetalleRepository.js";
import InventarioService from "../../inventario/application/InventarioService.js";
import EntregaRepository from "../../Entregas/infrastructure/repositories/EntregaRepository.js";
import VentaRepository from "../infrastructure/repositories/VentaRepository.js";
import RolRepository from "../../auth/infraestructure/repositories/RolRepository.js";
import InventarioCamionRepository from "../../Entregas/infrastructure/repositories/InventarioCamionRepository.js";

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
        tipo_documento,
        pago_recibido,
        referencia,
        lat,
        lng,
        id_venta = null,
        prioridad,
        id_sucursal,
        id_caja,
      } = data;

      let cliente = await ClienteRepository.findById(id_cliente);
      if (!cliente) throw new Error("El cliente no existe.");

      const creador = await UsuariosRepository.findByRutBasic(id_creador);
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

      // Sucursal y caja

      let effectiveSucursalId = id_sucursal ?? null;
      if (!effectiveSucursalId && id_venta) {
        const ventaOrigen = await VentaRepository.findById(id_venta);
        if (!ventaOrigen) throw new Error("La venta asociada no existe.");
        effectiveSucursalId = ventaOrigen.id_sucursal;
      }
      if (!effectiveSucursalId) {
        throw new Error("Debe especificar una sucursal para el pedido.");
      }

      const fecha_pedido = obtenerFechaActualChile();

      const nuevoPedido = await PedidoRepository.create(
        {
          id_cliente: cliente.id_cliente,
          id_creador,
          id_sucursal: effectiveSucursalId,
          direccion_entrega,
          lat,
          lng,
          id_metodo_pago: metodoPago ? metodoPago.id_metodo_pago : null,
          id_estado_pedido: estadoInicial.id_estado_venta,
          notas: notas ? notas : null,
          total: 0,
          estado_pago: pagado ? "Pagado" : "Pendiente",
          pagado: !!pagado,
          fecha_pedido: fecha_pedido,
          prioridad,
        },
        { transaction }
      );

      let totalPedido = 0;

      for (const item of productos) {
        if (item.tipo === "producto") {
          const producto = await ProductosRepository.findById(item.id_producto);
          if (!producto)
            throw new Error(`Producto no encontrado ID ${item.id_producto}`);

          const precioUnit =
            item.precio_unitario != null
              ? Number(item.precio_unitario)
              : Number(producto.precio);

          totalPedido += precioUnit * item.cantidad;

          await DetallePedidoRepository.create(
            {
              id_pedido: nuevoPedido.id_pedido,
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              precio_unitario: precioUnit,
              subtotal: precioUnit * item.cantidad,
              tipo: "producto",
            },
            { transaction }
          );
        } else if (item.tipo === "insumo") {
          const insumo = await InsumoRepository.findById(item.id_insumo);
          if (!insumo || !insumo.es_para_venta) {
            throw new Error(
              `Insumo ${item.id_insumo} no válido o no vendible.`
            );
          }

          const precioUnit =
            item.precio_unitario != null
              ? Number(item.precio_unitario)
              : Number(insumo.precio);

          totalPedido += precioUnit * item.cantidad;

          await DetallePedidoRepository.create(
            {
              id_pedido: nuevoPedido.id_pedido,
              id_insumo: item.id_insumo,
              cantidad: item.cantidad,
              precio_unitario: precioUnit,
              subtotal: precioUnit * item.cantidad,
              tipo: "insumo",
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

      const requiereFactura = tipo_documento === "factura";
      const ventaPagada = pagado && !requiereFactura;
      const vieneDesdeVenta = Boolean(data.id_venta);

      if (vieneDesdeVenta) {
        const ventaOrigen = await VentaRepository.findById(id_venta);
        if (!ventaOrigen) throw new Error("La venta asociada no existe.");

        if (ventaOrigen.id_sucursal !== effectiveSucursalId) {
          await PedidoRepository.update(
            nuevoPedido.id_pedido,
            { id_sucursal: ventaOrigen.id_sucursal },
            { transaction }
          );
        }
        await PedidoRepository.update(
          nuevoPedido.id_pedido,
          {
            id_venta,
            id_estado_pedido: estadoInicial.id_estado_venta,
            estado_pago: pagado ? "Pagado" : "Pendiente",
            pagado: !!pagado,
          },
          { transaction }
        );
        await transaction.commit();
        return await PedidoRepository.findById(nuevoPedido.id_pedido);
      }

      if (ventaPagada || requiereFactura) {
        let cajaElegida = null;

        if (id_caja) {
          cajaElegida = await CajaRepository.findById(id_caja);
          const valida =
            cajaElegida &&
            cajaElegida.estado === "abierta" &&
            cajaElegida.id_usuario === id_creador &&
            cajaElegida.id_sucursal === effectiveSucursalId;

          if (!valida) {
            throw new Error(
              "La caja indicada no es válida (debe estar abierta, ser tuya y pertenecer a la misma sucursal)."
            );
          }
        } else {
          const abiertas = await CajaRepository.findAbiertasByUsuarioYSucursal(
            id_creador,
            effectiveSucursalId
          );
          if (abiertas.length === 0) {
            throw new Error(
              "No tienes cajas abiertas en la sucursal seleccionada."
            );
          }
          if (abiertas.length > 1) {
            throw new Error(
              "Tienes varias cajas abiertas en esa sucursal. Debes seleccionar una (id_caja)."
            );
          }
          cajaElegida = abiertas[0];
        }

        const ventaRegistrada = await VentaService.createVenta(
          {
            id_cliente,
            id_vendedor: id_creador,
            id_caja: cajaElegida.id_caja,
            id_sucursal: effectiveSucursalId,
            tipo_entrega: "pedido_pagado_anticipado",
            direccion_entrega,
            productos,
            productos_retornables: [],
            id_metodo_pago: metodo_pago,
            notas,
            impuesto: 0,
            tipo_documento,
            pago_recibido: ventaPagada ? pago_recibido : null,
            referencia: ventaPagada ? referencia : null,
            id_pedido_asociado: nuevoPedido.id_pedido,
          },
          id_creador,
          transaction
        );

        await PedidoRepository.update(
          nuevoPedido.id_pedido,
          {
            id_venta: ventaRegistrada.venta.id_venta,
            id_estado_pedido: estadoInicial.id_estado_venta,
            estado_pago: requiereFactura ? "Pendiente" : "Pagado",
            pagado: !!pagado,
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

  async registrarDesdePedido({
    id_pedido,
    id_caja,
    tipo_documento,
    pago_recibido,
    referencia,
    notas,
    id_usuario_creador,
    id_metodo_pago: metodoPagoDesdeFront,
  }) {
    const transaction = await sequelize.transaction();
    try {
      const pedido = await PedidoRepository.findById(id_pedido, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!pedido) throw new Error("Pedido no encontrado.");

      if (
        pedido.id_venta ||
        pedido.estado_pago === "Pagado" ||
        pedido.pagado === true
      ) {
        throw new Error(
          "El pedido ya fue pagado o ya tiene una venta asociada."
        );
      }

      const cliente = await ClienteRepository.findById(pedido.id_cliente, {
        transaction,
      });
      const idMetodoPagoFinal = metodoPagoDesdeFront || pedido.id_metodo_pago;
      if (!idMetodoPagoFinal)
        throw new Error(
          "Debe especificar un método de pago para registrar la venta."
        );
      const metodoPago = await MetodoPagoRepository.findById(
        idMetodoPagoFinal,
        {
          transaction,
        }
      );
      if (!metodoPago)
        throw new Error("Método de pago no encontrado para el pedido.");
      await UsuariosRepository.findByRutBasic(id_usuario_creador, {
        transaction,
      });
      const caja = id_caja
        ? await CajaRepository.findById(id_caja, { transaction })
        : null;

      const detallesPedido = await DetallePedidoRepository.findByPedidoId(
        id_pedido,
        { transaction }
      );

      const productos = detallesPedido.map((d) => {
        if (d.id_producto) {
          return {
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
          };
        }
        return {
          id_producto: `insumo_${d.id_insumo}`,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        };
      });

      const ventaResult = await VentaService.createVenta(
        {
          id_cliente: cliente.id_cliente,
          id_vendedor: id_usuario_creador,
          id_caja: caja?.id_caja ?? null,
          id_sucursal: pedido.id_sucursal,
          tipo_entrega: "pedido_pagado_anticipado",
          direccion_entrega: pedido.direccion_entrega,
          productos,
          productos_retornables: [],
          id_metodo_pago: metodoPago.id_metodo_pago,
          notas,
          impuesto: 0,
          tipo_documento,
          pago_recibido,
          referencia,
          id_pedido_asociado: pedido.id_pedido,
        },
        id_usuario_creador
      );

      await PedidoRepository.update(
        id_pedido,
        {
          id_venta: ventaResult.venta.id_venta,
          estado_pago: "Pagado",
          pagado: true,
        },
        { transaction }
      );

      await transaction.commit();

      return {
        mensaje: "Venta registrada desde pedido exitosamente.",
        venta: ventaResult.venta,
        documento: ventaResult.documento,
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(
        `Error al registrar venta desde pedido: ${error.message}`
      );
    }
  }
  // Asignar de Pendiente -> Pendiente de Confirmación
  async asignarPedido(id_pedido, id_chofer) {
    try {
      const pedido = await PedidoRepository.findById(id_pedido);
      if (!pedido) throw new Error("Pedido no encontrado.");

      const chofer = await UsuariosRepository.findByRutBasic(id_chofer);
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
        mensaje: `📦 Pedido #${id_pedido}\nDirección: ${pedido.direccion_entrega}\nPrioridad: ${pedido.prioridad}`,
        tipo: "pedido_asignado",
      });
      WebSocketServer.emitToUser(id_chofer, {
        type: "actualizar_mis_pedidos",
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

      const id_chofer_previo = pedido.id_chofer;
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
      WebSocketServer.emitToUser(id_chofer_previo, {
        type: "actualizar_mis_pedidos",
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
    let admin, notificacion, viajeActivo;

    try {
      const pedido = await PedidoRepository.findById(id_pedido, {
        transaction,
      });
      if (!pedido || pedido.id_chofer !== id_chofer)
        throw new Error("Pedido no asignado a este chofer.");

      const detallesPedido = await DetallePedidoRepository.findByPedidoId(
        id_pedido,
        { transaction }
      );

      const detallesPedidoProductos = [];
      for (const item of detallesPedido) {
        const producto = await ProductosRepository.findById(item.id_producto, {
          transaction,
        });
        if (producto) detallesPedidoProductos.push(item);
      }

      viajeActivo = await AgendaViajesRepository.findByChoferAndEstado(
        id_chofer,
        "En Tránsito",
        { transaction }
      );

      let nuevoEstado;
      if (viajeActivo) {
        const inventarioDisponible =
          await InventarioCamionService.getInventarioDisponible(
            viajeActivo.id_camion,
            "",
            { transaction }
          );
        const cliente = await ClienteRepository.findById(pedido.id_cliente, {
          transaction,
        });

        for (const item of detallesPedidoProductos) {
          const producto = await ProductosRepository.findById(
            item.id_producto,
            { transaction }
          );
          const esRetornable = producto.es_retornable;
          const disponibleEnCamion = inventarioDisponible.find(
            (inv) => inv.id_producto === item.id_producto
          );

          if (
            !disponibleEnCamion ||
            disponibleEnCamion.cantidad < item.cantidad
          ) {
            nuevoEstado = await EstadoVentaRepository.findByNombre(
              "Pendiente Asignación",
              { transaction }
            );
            throw new Error(
              `Stock insuficiente para producto ${producto.nombre_producto}`
            );
          }

          await InventarioCamionService.reservarDesdeDisponible({
            id_camion: viajeActivo.id_camion,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            tipo: "Reservado",
            es_retornable: esRetornable,
            transaction,
          });
        }

        const documento = await DocumentoRepository.findByVentaId(
          pedido.id_venta,
          {
            transaction,
          }
        );
        const tipo_documento = documento[0]?.tipo_documento || "boleta";

        const nuevoDestino = {
          id_pedido: pedido.id_pedido,
          id_cliente: cliente.id_cliente,
          nombre_cliente: cliente.nombre,
          direccion: pedido.direccion_entrega,
          notas: pedido.notas || "",
          tipo_documento,
          lat: pedido?.lat || null,
          lng: pedido?.lng || null,
          prioridad: pedido.prioridad || "normal",
          fecha_creacion: pedido.fecha_pedido || new Date().toISOString(),
        };

        const destinosActuales = viajeActivo.destinos || [];
        destinosActuales.push(nuevoDestino);

        await AgendaViajesRepository.update(
          viajeActivo.id_agenda_viaje,
          { destinos: destinosActuales },
          { transaction }
        );

        nuevoEstado = await EstadoVentaRepository.findByNombre("En Entrega", {
          transaction,
        });
      } else {
        nuevoEstado = await EstadoVentaRepository.findByNombre("Confirmado", {
          transaction,
        });
      }

      await PedidoRepository.update(
        id_pedido,
        { id_estado_pedido: nuevoEstado.id_estado_venta },
        { transaction }
      );

      /*       admin = await UsuariosRepository.findByRol("administrador", {
        transaction,
      }); */

      /*  notificacion = await NotificacionService.enviarNotificacion({
        id_usuario: admin.rut,
        mensaje: `El chofer ${id_chofer} confirmó el pedido ${id_pedido}.`,
        tipo: "pedido_confirmado",
      }); */

      const rolAdministrador = await RolRepository.findByName("administrador");
      const admins = await UsuariosRepository.findAllByRol(rolAdministrador.id);

      for (const admin of admins) {
        notificacion = await NotificacionService.enviarNotificacion({
          id_usuario: admin.rut,
          mensaje: `El chofer ${id_chofer} confirmó el pedido ${id_pedido}.`,
          tipo: "pedido_confirmado",
          datos_adicionales: {
            id_agenda_viaje: viajeActivo?.id_agenda_viaje || null,
            id_pedido,
          },
        });
      }

      await transaction.commit();
      if (viajeActivo) {
        WebSocketServer.emitToUser(id_chofer, {
          type: "actualizar_agenda_chofer",
          data: {
            mensaje: `Tu agenda se actualizó con el pedido ${id_pedido}`,
          },
        });
      }
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al confirmar pedido: ${error.message}`);
    }

    return PedidoRepository.findById(id_pedido);
  }

  async revertirPedidoAEstado({ id_pedido, id_estado_destino, id_usuario }) {
    const t = await sequelize.transaction();
    let pedido;
    let nombreDestino = "";
    let nombreActual = "";
    try {
      pedido = await PedidoRepository.findById(id_pedido, { transaction: t });
      if (!pedido) throw new Error("Pedido no encontrado");

      const estados = [
        "Pendiente",
        "Pendiente de Confirmación",
        "Confirmado",
        "En Preparación",
        "En Entrega",
        "Completada",
      ];
      const estadoActual = await EstadoVentaRepository.findById(
        pedido.id_estado_pedido,
        { transaction: t }
      );
      const estadoDestino = await EstadoVentaRepository.findById(
        id_estado_destino,
        { transaction: t }
      );
      nombreActual = estadoActual.nombre_estado;
      nombreDestino = estadoDestino.nombre_estado;

      const idxActual = estados.indexOf(nombreActual);
      const idxDestino = estados.indexOf(nombreDestino);
      if (idxDestino === -1 || idxActual === -1)
        throw new Error("Estado no reconocido");
      if (idxDestino >= idxActual)
        throw new Error("Solo se permite volver a estados anteriores");

      for (let i = idxActual; i > idxDestino; i--) {
        const rollbackState = estados[i];

        switch (rollbackState) {
          case "Completada": {
            const entrega = await EntregaRepository.findEntregaParaReversa(
              { id_pedido: pedido.id_pedido },
              { transaction: t }
            );
            if (entrega) {
              const ahora = new Date();
              const fechaEntrega = new Date(entrega.fecha_hora);
              const horas = Math.abs((ahora - fechaEntrega) / 36e5);
              if (horas > 24)
                throw new Error(
                  "No se puede revertir entregas completadas de hace más de 24 horas."
                );
              if (entrega.productos_entregados) {
                for (const item of entrega.productos_entregados) {
                  await InventarioCamionService.devolverProductoAlCamion({
                    id_camion: entrega.id_camion,
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    transaction: t,
                  });
                }
              }
              if (Array.isArray(entrega.insumo_entregados)) {
                for (const item of entrega.insumo_entregados) {
                  await InventarioCamionService.devolverInsumoAlCamion({
                    id_camion: entrega.id_camion,
                    id_insumo: item.id_insumo,
                    cantidad: item.cantidad,
                    transaction: t,
                  });
                }
              }
              await EntregaRepository.updateDesdeAnulacion(
                entrega.id_entrega,
                { estado_entrega: "anulada" },
                { transaction: t }
              );
            }

            if (pedido.id_venta) {
              await VentaService.anularVenta(pedido.id_venta, id_usuario, {
                transaction: t,
              });
              await PedidoRepository.update(
                pedido.id_pedido,
                { pagado: false, estado_pago: "Pendiente", id_venta: null },
                { transaction: t }
              );
            }
            break;
          }

          case "En Entrega": {
            await this.procesarReversaEnEntrega(pedido, t);
            break;
          }

          case "En Preparación": {
            await this.procesarReversaEnPreparacion(pedido, t, 50);
            break;
          }

          case "Confirmado":
          case "Pendiente de Confirmación": {
            if (rollbackState === "Pendiente de Confirmación") {
              await PedidoRepository.update(
                pedido.id_pedido,
                { id_chofer: null },
                { transaction: t }
              );
            }
            break;
          }
        }
      }

      await PedidoRepository.update(
        id_pedido,
        { id_estado_pedido: id_estado_destino },
        { transaction: t }
      );

      await t.commit();
    } catch (err) {
      if (t && !t.finished) await t.rollback();
      throw err;
    }

    try {
      if (pedido?.id_chofer) {
        await NotificacionService.enviarNotificacion({
          id_usuario: pedido.id_chofer,
          mensaje: `Atención: El pedido #${pedido.id_pedido} fue revertido a '${nombreDestino}' por un administrador.`,
          tipo: "pedido_revertido",
        });
        WebSocketServer.emitToUser(pedido.id_chofer, {
          type: "actualizar_agenda_chofer",
        });
      }
    } catch (notifyErr) {
      console.error("Notif/WS post-commit error:", notifyErr);
    }

    return { message: "Pedido regresado exitosamente" };
  }

  async toggleMostrarEnTablero(id_pedido, mostrar_en_tablero) {
    const pedido = await PedidoRepository.findById(id_pedido, {
      include: [
        { model: EstadoVentaRepository.getModel(), as: "EstadoPedido" },
      ],
    });
    if (!pedido) throw new Error("Pedido no encontrado");

    const estado = pedido.EstadoPedido?.nombre_estado;

    const estadosPermitidos = [
      "Pendiente",
      "Pendiente de Confirmación",
      "Confirmado",
    ];

    if (mostrar_en_tablero && !estadosPermitidos.includes(estado)) {
      throw new Error(
        `No se puede mostrar en tablero un pedido en estado '${estado}'`
      );
    }

    pedido.mostrar_en_tablero = mostrar_en_tablero;
    await pedido.save();

    return pedido;
  }

  /**
   *
   */
  async procesarReversaEnEntrega(pedido, tOuter) {
    const viajeActivo = await AgendaViajesRepository.findByChoferAndEstado(
      pedido.id_chofer,
      "En Tránsito",
      { transaction: tOuter }
    );
    if (viajeActivo) {
      let destinos = viajeActivo.destinos || [];
      destinos = destinos.filter((d) => d.id_pedido !== pedido.id_pedido);
      await AgendaViajesRepository.update(
        viajeActivo.id_agenda_viaje,
        { destinos },
        { transaction: tOuter }
      );
    }
  }

  async procesarReversaEnPreparacion(pedido, tOuter, CHUNK = 50) {
    const viajeActivo = await AgendaViajesRepository.findByChoferAndEstado(
      pedido.id_chofer,
      "En Tránsito",
      { transaction: tOuter }
    );

    let id_camion_fuente = null;
    let detalles = [];

    if (viajeActivo) {
      id_camion_fuente = viajeActivo.id_camion;
      detalles = await DetallePedidoRepository.findByPedidoId(
        pedido.id_pedido,
        { transaction: tOuter }
      );
    } else {
      const agenda = await AgendaCargaRepository.findByChoferAndEstado(
        pedido.id_chofer,
        "Pendiente",
        { transaction: tOuter }
      );
      if (!agenda) return;
      id_camion_fuente = agenda.id_camion;
      detalles = await AgendaCargaDetalleRepository.findByAgendaAndPedido(
        agenda.id_agenda_carga,
        pedido.id_pedido,
        { transaction: tOuter }
      );
    }

    const id_sucursal_destino = pedido.id_sucursal;
    if (!id_sucursal_destino) {
      throw new Error("No se pudo determinar id_sucursal para devolver stock.");
    }

    const ESTADOS_RESERVA = [
      "En Camión - Reservado - Entrega",
      "En Camión - Reservado",
    ];

    for (let i = 0; i < detalles.length; i += CHUNK) {
      const slice = detalles.slice(i, i + CHUNK);

      await sequelize.transaction(
        { transaction: tOuter, type: Transaction.TYPES.IMMEDIATE },
        async (tChunk) => {
          for (const det of slice) {
            if (det.id_producto) {
              let restante = Number(det.cantidad) || 0;

              for (const estado of ESTADOS_RESERVA) {
                if (restante <= 0) break;

                const row =
                  await InventarioCamionRepository.findByCamionAndProduct(
                    id_camion_fuente,
                    det.id_producto,
                    estado,
                    { transaction: tChunk }
                  );
                const disponible = Number(row?.cantidad || 0);
                if (disponible <= 0) continue;

                const aRetirar = Math.min(restante, disponible);

                await InventarioCamionService.retirarProductoDelCamion(
                  id_camion_fuente,
                  det.id_producto,
                  aRetirar,
                  estado,
                  { transaction: tChunk }
                );
                restante -= aRetirar;
              }

              if (restante > 0) {
                throw new Error(
                  `No fue posible retirar ${restante} unid. del producto ${det.id_producto} desde el camión.`
                );
              }

              await InventarioService.agregarInventario({
                tipo: "producto",
                id_elemento: det.id_producto,
                id_sucursal: id_sucursal_destino,
                cantidad: det.cantidad,
                transaction: tChunk,
              });
            } else if (det.id_insumo) {
              let restante = Number(det.cantidad) || 0;

              for (const estado of ESTADOS_RESERVA) {
                if (restante <= 0) break;

                const row =
                  await InventarioCamionRepository.findByCamionAndInsumo(
                    id_camion_fuente,
                    det.id_insumo,
                    estado,
                    { transaction: tChunk }
                  );
                const disponible = Number(row?.cantidad || 0);
                if (disponible <= 0) continue;

                const aRetirar = Math.min(restante, disponible);

                await InventarioCamionService.retirarInsumoDelCamion(
                  id_camion_fuente,
                  det.id_insumo,
                  aRetirar,
                  estado,
                  { transaction: tChunk }
                );
                restante -= aRetirar;
              }

              if (restante > 0) {
                throw new Error(
                  `No fue posible retirar ${restante} unid. del insumo ${det.id_insumo} desde el camión.`
                );
              }

              await InventarioService.agregarInventario({
                tipo: "insumo",
                id_elemento: det.id_insumo,
                id_sucursal: id_sucursal_destino,
                cantidad: det.cantidad,
                transaction: tChunk,
              });
            }

            if (!viajeActivo && det.id_agenda_carga_detalle) {
              await AgendaCargaDetalleRepository.delete(
                det.id_agenda_carga_detalle,
                { transaction: tChunk }
              );
            }
          }
        }
      );
    }

    if (!viajeActivo) {
      const agenda = await AgendaCargaRepository.findByChoferAndEstado(
        pedido.id_chofer,
        "Pendiente",
        { transaction: tOuter }
      );
      if (agenda) {
        const quedan = await AgendaCargaDetalleRepository.findByAgendaId(
          agenda.id_agenda_carga,
          { transaction: tOuter }
        );
        if (quedan.length === 0) {
          await AgendaCargaRepository.update(
            agenda.id_agenda_carga,
            { estado: "Cancelada" },
            { transaction: tOuter }
          );
        }
      }
    }
  }

  async updateEstadoPedido(id_pedido, nuevoEstado) {
    const estadoPedido = await EstadoVentaRepository.findByNombre(nuevoEstado);
    if (!estadoPedido) throw new Error("Estado de pedido inválido.");

    await PedidoRepository.update(id_pedido, {
      id_estado_pedido: estadoPedido.id_estado_venta,
    });
    return await PedidoRepository.findById(id_pedido);
  }

  // Rechazar pedido
  async rejectPedido(id_pedido) {
    const pedido = await PedidoRepository.findById(id_pedido);

    const admin = await UsuariosRepository.findByRol("administrador");

    if (!pedido) {
      throw new Error("Pedido no encontrado.");
    }

    if (pedido.estado_pago === "Pagado" || pedido.pagado) {
      throw new Error("No se puede rechazar un pedido que ya fue pagado.");
    }

    const estadoActual = await EstadoVentaRepository.findById(
      pedido.id_estado_pedido
    );

    if (!estadoActual) {
      throw new Error("Estado de pedido inválido.");
    }

    if (estadoActual.nombre_estado !== "Pendiente de Confirmación") {
      throw new Error(
        "Solo se pueden rechazar pedidos en estado 'Pendiente de Confirmación'."
      );
    }

    const estadoPendiente = await EstadoVentaRepository.findByNombre(
      "Pendiente"
    );
    if (!estadoPendiente) {
      throw new Error("Estado 'Pendiente' no configurado.");
    }

    await PedidoRepository.update(id_pedido, {
      id_estado_pedido: estadoPendiente.id_estado_venta,
      id_chofer: null,
    });

    await NotificacionService.enviarNotificacion({
      id_usuario: admin.rut,
      mensaje: `El chofer rechazó el pedido #${pedido.id_pedido}. Estado revertido a 'Pendiente'.`,
      tipo: "pedido_revertido",
    });

    return await PedidoRepository.findById(id_pedido);
  }

  async revertPedido(id_pedido) {
    const pedido = await PedidoRepository.findById(id_pedido);

    if (!pedido) {
      throw new Error("Pedido no encontrado.");
    }

    const estadoActual = await EstadoVentaRepository.findById(
      pedido.id_estado_pedido
    );

    if (!estadoActual) {
      throw new Error("Estado de pedido inválido.");
    }

    if (estadoActual.nombre_estado !== "Rechazado") {
      throw new Error("Solo puedes revertir pedidos en estado 'Rechazado'.");
    }

    const estadoPendiente = await EstadoVentaRepository.findByNombre(
      "Pendiente"
    );
    if (!estadoPendiente) {
      throw new Error("Estado 'Pendiente' no configurado.");
    }

    await PedidoRepository.update(id_pedido, {
      id_estado_pedido: estadoPendiente.id_estado_venta,
    });

    return await PedidoRepository.findById(id_pedido);
  }

  async getPedidoById(id_pedido) {
    return await PedidoRepository.findById(id_pedido);
  }

  async getDetalleConTotal(id_pedido) {
    const pedido = await PedidoRepository.findById(id_pedido);
    if (!pedido) throw new Error("Pedido no encontrado");

    const detalles = await DetallePedidoRepository.findByPedidoId(id_pedido);
    const items = [];
    let total = 0;

    for (const item of detalles) {
      if (item.id_producto) {
        const producto = await ProductosRepository.findById(item.id_producto);
        if (!producto) continue;

        const subtotal = producto.precio * item.cantidad;
        total += subtotal;

        items.push({
          id_producto: producto.id_producto,
          nombre: producto.nombre_producto,
          cantidad: item.cantidad,
          precio_unitario: producto.precio,
          subtotal,
          es_retornable: producto.es_retornable,
          id_insumo: null,
        });
      } else if (item.id_insumo) {
        const insumo = await InsumoRepository.findById(item.id_insumo);
        if (!insumo) continue;

        const subtotal = insumo.precio * item.cantidad;
        total += subtotal;

        items.push({
          id_insumo: insumo.id_insumo,
          nombre: insumo.nombre_insumo,
          cantidad: item.cantidad,
          precio_unitario: insumo.precio,
          subtotal,
          es_retornable: false,
          id_producto: null,
        });
      }
    }

    return {
      id_pedido,
      detalle: items,
      monto_total: total,
      pagado: pedido.pagado,
    };
  }

  async deletePedido(id_pedido) {
    const pedido = await PedidoRepository.findById(id_pedido);
    if (!pedido) {
      return null;
    }

    if (!estadosInvalidosPedido.includes(pedido.id_estado_pedido)) {
      throw new Error(
        "No se puede eliminar un pedido que no está en estado permitido."
      );
    }

    await DetallePedidoRepository.deleteByPedidoId(id_pedido);
    return await PedidoRepository.delete(id_pedido);
  }

  /**
   * Obtener Pedidos
   */

  async getPedidos(filters = {}, options = {}) {
    console.log(filters);
    const intFields = ["id_cliente", "id_estado_pedido", "id_sucursal"];
    const textFields = ["direccion_entrega", "id_chofer"];

    const where = createFilter(filters, { intFields, textFields });

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
      const { inicioUTC, finUTC } = obtenerRangoUTCDesdeFechaLocal(
        options.fecha
      );

      where.fecha_pedido = {
        [Op.between]: [inicioUTC, finUTC],
      };
    }

    if (options.soloTablero) {
      where.mostrar_en_tablero = true;
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
          {
            model: InsumoRepository.getModel(),
            as: "Insumo",
            attributes: ["id_insumo", "nombre_insumo", "precio"],
          },
        ],
      },
    ];

    console.log("WHERE getPedidos:", where);
    const result = await paginate(PedidoRepository.getModel(), options, {
      where,
      include,
      order: [["fecha_pedido", "DESC"]],
    });

    return result;
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
              attributes: [
                "id_producto",
                "nombre_producto",
                "precio",
                "es_retornable",
              ],
              required: false,
            },
            {
              model: InsumoRepository.getModel(),
              as: "Insumo",
              attributes: ["id_insumo", "nombre_insumo", "precio"],
              required: false,
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

    return pedidos.map((pedido) => ({
      id_pedido: pedido.id_pedido,
      cliente: {
        id_cliente: pedido.Cliente?.id_cliente || null,
        nombre: pedido.Cliente?.nombre || "Sin nombre",
        direccion: pedido.Cliente?.direccion || "Sin dirección",
      },
      productos: pedido.DetallesPedido.map((detalle) => {
        if (detalle.Producto) {
          return {
            id_producto: detalle.Producto.id_producto,
            nombre_producto: detalle.Producto.nombre_producto,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.Producto.precio,
            subtotal: detalle.subtotal,
            es_retornable: detalle.Producto.es_retornable,
          };
        } else if (detalle.Insumo) {
          return {
            id_insumo: detalle.Insumo.id_insumo,
            nombre_insumo: detalle.Insumo.nombre_insumo,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.Insumo.precio,
            subtotal: detalle.subtotal,
          };
        } else {
          return {
            cantidad: detalle.cantidad,
            subtotal: detalle.subtotal,
            nombre_producto: "Ítem desconocido",
          };
        }
      }),
      fecha_pedido: pedido.fecha_pedido,
    }));
  }

  async obtenerHistorialPedidos(id_chofer, fecha, options = {}) {
    const where = {
      id_chofer: id_chofer,
      fecha_pedido: {
        [Op.between]: [`${fecha} 00:00:00`, `${fecha} 23:59:59`],
      },
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

    const result = await paginate(PedidoRepository.getModel(), options, {
      where,
      include,
      order: [["id_pedido", "DESC"]],
    });

    return result;
  }

  async obtenerPedidosAsignados(id_chofer, options = {}) {
    return await this.getPedidos({ id_chofer }, options);
  }

  async obtenerPedidosSinAsignar(options = {}) {
    return await this.getPedidos({ id_chofer: { [Op.is]: null } }, options);
  }

  async obtenerMisPedidos(id_chofer, options = {}) {
    return await this.getPedidos({ id_chofer }, options);
  }
}

export default new PedidoService();

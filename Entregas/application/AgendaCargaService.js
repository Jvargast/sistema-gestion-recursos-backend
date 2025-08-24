import { Op, Sequelize } from "sequelize";
import InventarioService from "../../inventario/application/InventarioService.js";
import createFilter from "../../shared/utils/helpers.js";
import AgendaCargaRepository from "../infrastructure/repositories/AgendaCargaRepository.js";
import InventarioCamionService from "./InventarioCamionService.js";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import paginate from "../../shared/utils/pagination.js";
import CamionRepository from "../infrastructure/repositories/CamionRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import AgendaCargaDetalleRepository from "../infrastructure/repositories/AgendaCargaDetalleRepository.js";
import sequelize from "../../database/database.js";
import DetallePedidoRepository from "../../ventas/infrastructure/repositories/DetallePedidoRepository.js";
import PedidoRepository from "../../ventas/infrastructure/repositories/PedidoRepository.js";
import EstadoVentaRepository from "../../ventas/infrastructure/repositories/EstadoVentaRepository.js";
import InsumoRepository from "../../inventario/infrastructure/repositories/InsumoRepository.js";
import AgendaViajesRepository from "../infrastructure/repositories/AgendaViajesRepository.js";
import ClienteRepository from "../../ventas/infrastructure/repositories/ClienteRepository.js";
import CajaRepository from "../../ventas/infrastructure/repositories/CajaRepository.js";
import { getEstadoCamion } from "../../shared/utils/estadoCamion.js";
import DocumentoRepository from "../../ventas/infrastructure/repositories/DocumentoRepository.js";
import {
  obtenerFechaActualChile,
  obtenerFechaActualChileUTC,
  obtenerLimitesUTCParaDiaChile,
} from "../../shared/utils/fechaUtils.js";
import UbicacionChoferService from "../../auth/application/UbicacionChoferService.js";
import WebSocketServer from "../../shared/websockets/WebSocketServer.js";
import RolRepository from "../../auth/infraestructure/repositories/RolRepository.js";
import SucursalRepository from "../../auth/infraestructure/repositories/SucursalRepository.js";

class AgendaCargaService {
  // Pedido de Confirmado -> En Preparación
  async createAgenda(
    id_usuario_chofer,
    rut,
    id_camion,
    prioridad,
    notas,
    productos,
    descargarRetornables = false,
    id_sucursal
  ) {
    const t = await sequelize.transaction();

    try {
      /**
       * Validaciones
       */
      if (!id_usuario_chofer || !id_camion) {
        throw new Error(
          "Faltan datos obligatorios para crear la agenda de carga."
        );
      }
      const chofer = await UsuariosRepository.findByRut(id_usuario_chofer, {
        transaction: t,
      });
      if (!chofer) {
        throw new Error("El chofer seleccionado no existe.");
      }
      const camion = await CamionRepository.findById(id_camion, {
        transaction: t,
      });
      if (Number(camion.id_sucursal) !== Number(id_sucursal)) {
        throw new Error("El camión no pertenece a la sucursal seleccionada.");
      }
      if (!camion || camion.estado !== "Disponible") {
        throw new Error("El camión seleccionado no está disponible.");
      }
      if (camion.id_chofer_asignado !== id_usuario_chofer) {
        throw new Error("El chofer no está asignado a este camión.");
      }

      // Pedodido -> Confirmado
      const estadoConfirmado = await EstadoVentaRepository.findByNombre(
        "Confirmado",
        { transaction: t }
      );
      // Pedido -> En Preparación
      const estadoEnPreparacion = await EstadoVentaRepository.findByNombre(
        "En Preparación",
        { transaction: t }
      );

      if (!estadoConfirmado || !estadoEnPreparacion)
        throw new Error("Estados necesarios no configurados correctamente.");

      //Se buscan pedidos confirmados por chofer
      const pedidosConfirmados =
        await PedidoRepository.findAllByChoferAndEstado(
          id_usuario_chofer,
          estadoConfirmado.id_estado_venta,
          { transaction: t }
        );

      const hayAdicionales = Array.isArray(productos) && productos.length > 0;

      if (!pedidosConfirmados.length && !hayAdicionales) {
        throw new Error(
          "Debe existir al menos un pedido confirmado o productos adicionales."
        );
      }

      const fecha = obtenerFechaActualChileUTC();

      const nuevaAgenda = await AgendaCargaRepository.create(
        {
          id_usuario_chofer,
          id_usuario_creador: rut,
          id_camion,
          prioridad,
          estado: "Pendiente",
          notas,
          fecha_hora: fecha,
          id_sucursal,
        },
        { transaction: t }
      );

      if (descargarRetornables) {
        const inventarioActual =
          await InventarioCamionService.getInventarioByCamion(id_camion, {
            transaction: t,
          });

        for (const item of inventarioActual) {
          if (
            item.es_retornable &&
            item.cantidad > 0 &&
            item.estado === "En Camión - Retorno"
          ) {
            await InventarioCamionService.retirarProductoDelCamion(
              id_camion,
              item.id_producto,
              item.cantidad,
              "En Camión - Retorno",
              { transaction: t }
            );
          }
        }
      }

      const inventarioActualizado =
        await InventarioCamionService.getInventarioByCamion(id_camion, {
          transaction: t,
        });
      const espacioUsado = inventarioActualizado
        .filter((p) => p.es_retornable)
        .reduce((sum, item) => sum + item.cantidad, 0);
      let espacioDisponible = camion.capacidad - espacioUsado;

      const detallesCarga = [];

      for (const pedido of pedidosConfirmados) {
        const detallesPedido = await DetallePedidoRepository.findByPedidoId(
          pedido.id_pedido,
          { transaction: t }
        );
        for (const item of detallesPedido) {
          const esProducto = item.id_producto !== null;
          let productoInfo,
            insumoInfo,
            es_retornable = false,
            unidad_medida = "unidad";

          if (esProducto) {
            productoInfo = await ProductosRepository.findById(
              item.id_producto,
              { transaction: t }
            );
            es_retornable = productoInfo.es_retornable;

            if (es_retornable && item.cantidad > espacioDisponible) {
              throw new Error(
                `Espacio insuficiente para ${productoInfo.nombre_producto}`
              );
            }
            await InventarioService.decrementarStock(
              item.id_producto,
              id_sucursal,
              item.cantidad,
              { transaction: t }
            );
            await InventarioCamionService.addOrUpdateProductoCamion(
              {
                id_camion,
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                estado: getEstadoCamion(es_retornable, true),
                tipo: "Reservado",
                es_retornable,
              },
              t
            );
            if (es_retornable) espacioDisponible -= item.cantidad;
            unidad_medida = productoInfo.unidad_medida || "unidad";
          } else {
            insumoInfo = await InsumoRepository.findById(item.id_insumo, {
              transaction: t,
            });
            if (!insumoInfo) {
              throw new Error(
                `Producto/Insumo ID ${item.id_producto} no existe.`
              );
            }
            await InventarioService.decrementarStockInsumo(
              item.id_insumo,
              id_sucursal,
              item.cantidad,
              { transaction: t }
            );

            await InventarioCamionService.addOrUpdateProductoCamion(
              {
                id_camion,
                id_insumo: item.id_insumo,
                cantidad: item.cantidad,
                estado: getEstadoCamion(false, true),
                tipo: "Reservado",
                es_retornable: false,
              },
              { transaction: t }
            );
            unidad_medida = insumoInfo.unidad_de_medida || "unidad";
          }

          detallesCarga.push({
            id_agenda_carga: nuevaAgenda.id_agenda_carga,
            id_producto: productoInfo ? productoInfo.id_producto : null,
            id_insumo: insumoInfo ? insumoInfo.id_insumo : null,
            cantidad: item.cantidad,
            unidad_medida,
            estado: "Pendiente",
            notas: `Pedido ID ${pedido?.id_pedido}`,
            id_pedido: pedido.id_pedido || null,
          });
        }
        // Actualizar pedido a estado 'En Preparación'
        await PedidoRepository.update(
          pedido.id_pedido,
          {
            id_estado_pedido: estadoEnPreparacion.id_estado_venta,
          },
          { transaction: t }
        );
      }

      for (const adicional of productos) {
        const esProducto = adicional.id_producto ? true : false;
        let es_retornable = false;
        let unidad_medida = "unidad";

        if (esProducto) {
          const productoInfo = await ProductosRepository.findById(
            adicional.id_producto,
            { transaction: t }
          );
          es_retornable = productoInfo.es_retornable;

          if (es_retornable && adicional.cantidad > espacioDisponible) {
            throw new Error(
              `Espacio insuficiente para adicional ${productoInfo.nombre_producto}`
            );
          }

          await InventarioService.decrementarStock(
            adicional.id_producto,
            id_sucursal,
            adicional.cantidad,
            { transaction: t }
          );

          await InventarioCamionService.addOrUpdateProductoCamion(
            {
              id_camion,
              id_producto: adicional.id_producto,
              cantidad: adicional.cantidad,
              estado: getEstadoCamion(es_retornable, false),
              tipo: "Disponible",
              es_retornable,
            },
            { transaction: t }
          );

          if (es_retornable) espacioDisponible -= adicional.cantidad;

          detallesCarga.push({
            id_agenda_carga: nuevaAgenda.id_agenda_carga,
            id_producto: adicional.id_producto,
            cantidad: adicional.cantidad,
            unidad_medida: unidad_medida,
            estado: "Pendiente",
            notas: adicional.notas || null,
          });
        } else if (adicional.id_insumo) {
          const insumoInfo = await InsumoRepository.findById(
            adicional.id_insumo,
            { transaction: t }
          );
          if (!insumoInfo) {
            throw new Error(
              `Insumo adicional con ID ${adicional.id_insumo} no encontrado.`
            );
          }
          await InventarioService.decrementarStockInsumo(
            adicional.id_insumo,
            id_sucursal,
            adicional.cantidad,
            { transaction: t }
          );

          await InventarioCamionService.addOrUpdateProductoCamion(
            {
              id_camion,
              id_insumo: adicional.id_insumo,
              cantidad: adicional.cantidad,
              estado: "En Camión - Disponible",
              tipo: "Disponible",
              es_retornable: false,
            },
            { transaction: t }
          );

          detallesCarga.push({
            id_agenda_carga: nuevaAgenda.id_agenda_carga,
            id_insumo: adicional.id_insumo,
            cantidad: adicional.cantidad,
            unidad_medida: adicional.unidad_medida || "unidad",
            estado: "Pendiente",
            notas: adicional.notas || null,
          });
        }
      }

      await AgendaCargaDetalleRepository.bulkCreate(detallesCarga, {
        transaction: t,
      });

      await t.commit();
      return nuevaAgenda;
    } catch (error) {
      console.error("Error al crear la agenda:", error);
      if (t.finished !== "commit") {
        await t.rollback();
      }
      throw new Error(`Error al crear la agenda: ${error.message}`);
    }
  }
  //Pedido de En Preparación -> En Entrega
  async confirmarCargaCamion(
    id_agenda_carga,
    id_chofer,
    productosCargados,
    notasChofer = "",
    origen_inicial
  ) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Validar la agenda de carga
      const agendaCarga = await AgendaCargaRepository.findById(
        id_agenda_carga,
        { transaction }
      );
      if (!agendaCarga) throw new Error("Agenda de carga no encontrada.");
      if (agendaCarga.estado !== "Pendiente")
        throw new Error("Esta agenda ya fue confirmada o cancelada.");

      if (agendaCarga.id_usuario_chofer !== id_chofer)
        throw new Error("Este chofer no está asignado a la agenda.");

      const fecha = obtenerFechaActualChileUTC();

      const camion = await CamionRepository.findById(agendaCarga.id_camion, {
        transaction,
      });
      if (!camion) throw new Error("Camión asignado no encontrado.");
      if (camion.estado !== "Disponible")
        throw new Error("Camión no disponible para iniciar ruta.");

      const chofer = await UsuariosRepository.findByRut(id_chofer, {
        transaction,
      });
      if (!chofer) throw new Error("Chofer no encontrado.");

      const inventarioCamion = await InventarioCamionRepository.findByCamionId(
        camion.id_camion,
        { transaction }
      );

      const cajaAsignada = await CajaRepository.findByAsignado(id_chofer, {
        transaction,
      });
      if (!cajaAsignada) throw new Error("El Chofer debe tener caja asignada");

      const resumenInventarioCamion = {
        disponibles: {},
        reservados: {},
      };

      const id_sucursal = chofer?.id_sucursal;
      if (!id_sucursal)
        throw new Error("El chofer no tiene sucursal asignada.");

      inventarioCamion.forEach((item) => {
        const key = item.id_producto
          ? `producto_${item.id_producto}`
          : `insumo_${item.id_insumo}`;
        if (item.estado === "En Camión - Disponible") {
          resumenInventarioCamion.disponibles[key] =
            (resumenInventarioCamion.disponibles[key] || 0) + item.cantidad;
        } else if (
          item.estado === "En Camión - Reservado" ||
          item.estado === "En Camión - Reservado - Entrega"
        ) {
          resumenInventarioCamion.reservados[key] =
            (resumenInventarioCamion.reservados[key] || 0) + item.cantidad;
        }
      });

      // 2. Validar los productos cargados (Físico vs Virtual)
      const detallesAgenda = await AgendaCargaDetalleRepository.findByAgendaId(
        id_agenda_carga,
        { transaction }
      );

      // Primero crear un resumen agrupado del detalle de la agenda
      const resumenDetalleAgenda = detallesAgenda.reduce((acc, item) => {
        const key = item.id_producto
          ? `producto_${item.id_producto}`
          : `insumo_${item.id_insumo}`;
        acc[key] = (acc[key] || 0) + item.cantidad;
        return acc;
      }, {});

      const resumenCargado = productosCargados.reduce((acc, item) => {
        const key = item.id_producto
          ? `producto_${item.id_producto}`
          : `insumo_${item.id_insumo}`;
        acc[key] = (acc[key] || 0) + item.cantidad;
        return acc;
      }, {});

      for (const key of Object.keys(resumenDetalleAgenda)) {
        const cantidadPlanificada = resumenDetalleAgenda[key] || 0;
        const cantidadCargada = resumenCargado[key] || 0;
        const cantidadDisponibleAntes =
          resumenInventarioCamion.disponibles[key] || 0;
        const cantidadReservadaAntes =
          resumenInventarioCamion.reservados[key] || 0;
        const cantidadTotalAntes =
          cantidadDisponibleAntes + cantidadReservadaAntes;

        if (cantidadTotalAntes > 0) {
          const cantidadFinal = cantidadTotalAntes + cantidadCargada;

          if (cantidadFinal < cantidadPlanificada) {
            throw new Error(
              `Cantidad insuficiente para ${key}: Se esperaba ${cantidadPlanificada}, pero solo hay ${cantidadFinal}.`
            );
          }
        } else {
          if (cantidadCargada !== cantidadPlanificada) {
            throw new Error(
              `Diferencia en carga para ${key}: Esperado ${cantidadPlanificada}, pero cargado ${cantidadCargada}.`
            );
          }
        }
      }

      await CajaRepository.update(
        cajaAsignada.id_caja,
        {
          estado: "abierta",
          fecha_apertura: fecha,
          saldo_inicial: cajaAsignada.monto_apertura || 0,
        },
        { transaction }
      );

      await AgendaCargaDetalleRepository.updateEstadoByAgendaId(
        id_agenda_carga,
        { estado: "Cargado" },
        { transaction }
      );
      await AgendaCargaRepository.update(
        agendaCarga.id_agenda_carga,
        {
          estado: "Completada",
          validada_por_chofer: true,
          notas: notasChofer || agendaCarga.notas,
          hora_estimacion_fin: fecha,
        },
        { transaction }
      );

      await CamionRepository.update(
        camion.id_camion,
        { estado: "En Ruta" },
        { transaction }
      );

      const estadoEnPreparacion = await EstadoVentaRepository.findByNombre(
        "En Preparación",
        { transaction }
      );
      if (!estadoEnPreparacion)
        throw new Error("Estado 'En Preparación' no configurado.");

      const pedidosEnPreparacion =
        await PedidoRepository.findAllByChoferAndEstado(
          id_chofer,
          estadoEnPreparacion.id_estado_venta
        );

      const estadoEnEntrega = await EstadoVentaRepository.findByNombre(
        "En Entrega",
        { transaction }
      );
      if (!estadoEnEntrega)
        throw new Error("Estado 'En Entrega' no configurado.");

      const destinos = [];
      if (pedidosEnPreparacion.length) {
        for (const pedido of pedidosEnPreparacion) {
          const cliente = await ClienteRepository.findById(pedido.id_cliente);

          let tipo_documento = null;
          if (pedido.id_venta) {
            const documento = await DocumentoRepository.findByVentaId(
              pedido.id_venta,
              {
                transaction,
              }
            );
            tipo_documento = documento[0]?.tipo_documento;
          }

          destinos.push({
            id_pedido: pedido.id_pedido,
            id_cliente: cliente.id_cliente,
            nombre_cliente: cliente.nombre,
            direccion: pedido.direccion_entrega,
            notas: pedido.notas || "",
            tipo_documento: tipo_documento || "boleta",
            lat: pedido?.lat || null,
            lng: pedido?.lng || null,
            prioridad: pedido.prioridad || "normal",
            fecha_creacion: pedido.fecha_pedido || new Date().toISOString(),
          });
          await PedidoRepository.update(
            pedido.id_pedido,
            {
              id_estado_pedido: estadoEnEntrega.id_estado_venta,
            },
            { transaction }
          );
        }
      }

      const nuevaAgendaViaje = await AgendaViajesRepository.create(
        {
          id_agenda_carga,
          id_camion: camion.id_camion,
          id_chofer,
          id_sucursal,
          inventario_inicial: productosCargados,
          destinos,
          estado: "En Tránsito",
          fecha_inicio: fecha,
          notas: `Viaje iniciado. Agenda carga: ${id_agenda_carga}`,
          validado_por_chofer: true,
          origen_inicial,
        },
        { transaction }
      );

      await transaction.commit();

      await UbicacionChoferService.registrarUbicacion({
        rut: id_chofer,
        lat: origen_inicial.lat,
        lng: origen_inicial.lng,
        timestamp: obtenerFechaActualChile(),
      });

      const rolAdministrador = await RolRepository.findByName("administrador");
      const admins = await UsuariosRepository.findAllByRol(rolAdministrador.id);

      for (const admin of admins) {
        WebSocketServer.emitToUser(admin.rut, {
          type: "nueva_ubicacion_chofer",
          data: {
            rut: id_chofer,
            lat: origen_inicial.lat,
            lng: origen_inicial.lng,
            timestamp: obtenerFechaActualChile(),
            origen: true,
          },
        });
      }

      return {
        message: "Carga confirmada y viaje iniciado con éxito.",
        agendaViaje: nuevaAgendaViaje,
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al confirmar carga: ${error.message}`);
    }
  }

  async findAll(filters, options) {
    try {
      const where = {};

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.fecha_carga = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin],
        };
      }

      if (filters.id_chofer) {
        where.id_chofer = filters.id_chofer;
      }

      if (filters.estado) {
        where.estado = filters.estado;
      }

      if (filters.id_sucursal) {
        where.id_sucursal = Number(filters.id_sucursal);
      }

      const result = await paginate(AgendaCargaRepository.getModel(), options, {
        where,
        include: [
          {
            model: UsuariosRepository.getModel(),
            as: "chofer",
            attributes: ["rut", "nombre"],
          },
          {
            model: CamionRepository.getModel(),
            as: "camion",
            attributes: ["id_camion", "placa"],
          },
          {
            model: SucursalRepository.getModel(),
            as: "Sucursal",
          },
        ],
        order: [["fecha_hora", "DESC"]],
      });
      return result;
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }

  async getAgendaById(id) {
    const agenda = await AgendaCargaRepository.findById(id);

    if (!agenda) {
      throw new Error("Agenda not found");
    }
    const detalles = await AgendaCargaDetalleRepository.findByAgendaId(id);

    return {
      ...agenda.toJSON(),
      detalles,
    };
  }

  async getAllAgendas(filters = {}, options) {
    const allowedFields = [
      "id_agenda_carga",
      "fechaHora",
      "notas",
      "id_usuario_chofer",
    ];

    const where = createFilter(filters, allowedFields);

    if (options.creador?.rol?.nombre === "chofer") {
      where.id_usuario_chofer = {
        [Op.like]: `${options.creador?.rut}`,
      };
    }

    if (options.date) {
      const [inicioUTC, finUTC] = obtenerLimitesUTCParaDiaChile(options.date);
      where.fechaHora = {
        [Sequelize.Op.between]: [inicioUTC, finUTC],
      };
    }
    const include = [
      {
        model: UsuariosRepository.getModel(),
        as: "usuario",
        attributes: ["rut", "nombre", "email"],
      },
      {
        model: CamionRepository.getModel(),
        as: "camion",
        include: [
          { model: InventarioCamionRepository.getModel(), as: "inventario" },
        ],
      },
    ];
    const result = await paginate(AgendaCargaRepository.getModel(), options, {
      where,
      include,
      order: [["id_agenda_carga", "ASC"]],
      distinctCol: "id_agenda_carga",
    });
    return result;
  }

  async getInventarioDisponiblePorChofer(rut) {
    // Obtener la agenda activa del chofer
    const agenda = await AgendaCargaRepository.findByChoferAndEstado(
      rut,
      "En tránsito"
    );

    if (!agenda) {
      throw new Error("No tienes una agenda activa asociada.");
    }

    // Obtener el inventario disponible del camión asociado
    return await InventarioCamionService.getInventarioDisponible(
      agenda.id_camion
    );
  }

  async getAgendaCargaDelDia(id_chofer, inicioUTC, finUTC) {
    if (!id_chofer) {
      throw new Error("Se requiere el ID del chofer.");
    }

    const agenda = await AgendaCargaRepository.findOneByConditions({
      where: {
        id_usuario_chofer: id_chofer,
        fecha_hora: {
          [Op.between]: [inicioUTC, finUTC],
        },
        estado: "Pendiente",
        validada_por_chofer: false,
      },
      include: [
        {
          model: AgendaCargaDetalleRepository.getModel(),
          as: "detallesCarga",
          include: [
            {
              model: ProductosRepository.getModel(),
              as: "producto",
              attributes: ["id_producto", "nombre_producto"],
              include: [
                {
                  model: InventarioCamionRepository.getModel(),
                  as: "inventariosProducto",
                  attributes: ["cantidad", "estado", "tipo", "es_retornable"],
                },
              ],
            },
            {
              model: InsumoRepository.getModel(),
              as: "insumo",
              attributes: ["id_insumo", "nombre_insumo"],
              include: [
                {
                  model: InventarioCamionRepository.getModel(),
                  as: "inventariosInsumo",
                  attributes: ["cantidad", "estado", "tipo", "es_retornable"],
                },
              ],
            },
          ],
        },
      ],
      order: [["fecha_hora", "ASC"]],
    });

    if (!agenda) return null;

    // Procesar la agenda para separar reservados y disponibles
    const productos = {};

    for (const detalle of agenda.detallesCarga) {
      const key = detalle.id_producto
        ? `producto_${detalle.id_producto}`
        : `insumo_${detalle.id_insumo}`;

      const inventarios =
        detalle.producto?.inventariosProducto ||
        detalle.insumo?.inventariosInsumo ||
        [];

      productos[key] = {
        nombre:
          detalle.producto?.nombre_producto || detalle.insumo?.nombre_insumo,
        cantidadPlanificada: detalle.cantidad,
        reservados: 0,
        disponibles: 0,
      };

      for (const item of inventarios) {
        if (item.estado === "En Camión - Reservado") {
          productos[key].reservados += item.cantidad;
        } else if (item.estado === "En Camión - Disponible") {
          productos[key].disponibles += item.cantidad;
        }
      }
    }

    return {
      ...agenda.toJSON(),
      resumenProductos: productos,
    };
  }

  async updateAgenda(id, data) {
    return await AgendaCargaRepository.update(id, data);
  }

  async deleteAgenda(id) {
    return await AgendaCargaRepository.delete(id);
  }
}

export default new AgendaCargaService();

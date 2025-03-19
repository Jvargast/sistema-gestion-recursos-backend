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

class AgendaCargaService {
  async createAgenda(
    id_usuario_chofer,
    rut,
    id_camion,
    prioridad,
    notas,
    productos,
    descargarRetornables = false
  ) {
    const t = await sequelize.transaction();

    try {
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
      if (!camion || camion.estado !== "Disponible") {
        throw new Error("El camión seleccionado no está disponible.");
      }
      if (camion.id_chofer_asignado !== id_usuario_chofer) {
        throw new Error("El chofer no está asignado a este camión.");
      }

      const estadoConfirmado = await EstadoVentaRepository.findByNombre(
        "Confirmado",
        { transaction: t }
      );
      const estadoEnPreparacion = await EstadoVentaRepository.findByNombre(
        "En Preparación",
        { transaction: t }
      );

      if (!estadoConfirmado || !estadoEnPreparacion)
        throw new Error("Estados necesarios no configurados correctamente.");

      const pedidosConfirmados =
        await PedidoRepository.findAllByChoferAndEstado(
          id_usuario_chofer,
          estadoConfirmado.id_estado_venta,
          { transaction: t }
        );

      if (!pedidosConfirmados.length)
        throw new Error("Sin pedidos confirmados.");

      const nuevaAgenda = await AgendaCargaRepository.create(
        {
          id_usuario_chofer,
          id_usuario_creador: rut,
          id_camion,
          prioridad,
          estado: "Pendiente",
          notas,
          fecha_hora: new Date(),
        },
        { transaction: t }
      );

      if (descargarRetornables) {
        const inventarioActual =
          await InventarioCamionService.getInventarioByCamion(id_camion, {
            transaction: t,
          });
        for (const item of inventarioActual) {
          if (item.es_retornable && item.cantidad > 0) {
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
              item.cantidad,
              { transaction: t }
            );
            await InventarioCamionService.addOrUpdateProductoCamion(
              {
                id_camion,
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                estado: "En Camión - Reservado",
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
              item.cantidad,
              { transaction: t }
            );

            await InventarioCamionService.addOrUpdateProductoCamion(
              {
                id_camion,
                id_insumo: item.id_insumo,
                cantidad: item.cantidad,
                estado: "En Camión - Reservado",
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
            notas: `Pedido ID ${pedido.id_pedido}`,
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
            adicional.cantidad,
            { transaction: t }
          );

          await InventarioCamionService.addOrUpdateProductoCamion(
            {
              id_camion,
              id_producto: adicional.id_producto,
              cantidad: adicional.cantidad,
              estado: "En Camión - Disponible",
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
      if (t.finished !== "commit") {
        await t.rollback();
      }
      throw new Error(`Error al crear la agenda: ${error.message}`);
    }
  }

  async confirmarCargaCamion(
    id_agenda_carga,
    id_chofer,
    productosCargados,
    notasChofer = ""
  ) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Validar la agenda de carga
      const agendaCarga = await AgendaCargaRepository.findById(id_agenda_carga);
      if (!agendaCarga) throw new Error("Agenda de carga no encontrada.");
      if (agendaCarga.estado !== "Pendiente")
        throw new Error("Esta agenda ya fue confirmada o cancelada.");

      if (agendaCarga.id_usuario_chofer !== id_chofer)
        throw new Error("Este chofer no está asignado a la agenda.");

      const camion = await CamionRepository.findById(agendaCarga.id_camion);
      if (!camion) throw new Error("Camión asignado no encontrado.");
      if (camion.estado !== "Disponible")
        throw new Error("Camión no disponible para iniciar ruta.");

      // 2. Validar los productos cargados (Físico vs Virtual)
      const detallesAgenda = await AgendaCargaDetalleRepository.findByAgendaId(
        id_agenda_carga
      );

      // Primero crear un resumen agrupado del detalle de la agenda
      const resumenDetalleAgenda = detallesAgenda.reduce((acc, item) => {
        const key = item.id_producto
          ? `producto_${item.id_producto}`
          : `insumo_${item.id_insumo}`;
        acc[key] = (acc[key] || 0) + item.cantidad;
        return acc;
      }, {});

      // Ahora crear resumen de cantidades cargadas por producto/insumo
      const resumenCargado = productosCargados.reduce((acc, item) => {
        const key = item.id_producto
          ? `producto_${item.id_producto}`
          : `insumo_${item.id_insumo}`;
        acc[key] = (acc[key] || 0) + item.cantidad;
        return acc;
      }, {});

      // Finalmente, comparar ambos resúmenes agrupados
      for (const key of Object.keys(resumenDetalleAgenda)) {
        if (
          !resumenCargado[key] ||
          resumenCargado[key] !== resumenDetalleAgenda[key]
        ) {
          const [tipo, id] = key.split("_");
          throw new Error(
            `Diferencia en cantidades para ${tipo} ID ${id}: Esperado ${
              resumenDetalleAgenda[key]
            }, cargado ${resumenCargado[key] || 0}.`
          );
        }
      }

      // Actualizar estado de los detalles a "Cargado"
      await AgendaCargaDetalleRepository.updateEstadoByAgendaId(
        id_agenda_carga,
        "Cargado",
        { transaction }
      );
      // 3. Actualizar estado de la AgendaCarga
      await AgendaCargaRepository.update(
        agendaCarga.id_agenda_carga,
        {
          estado: "Completada",
          validada_por_chofer: true,
          notas: notasChofer || agendaCarga.notas,
          hora_estimacion_fin: new Date(),
        },
        { transaction }
      );

      // 4. Actualizar estado del Camión a "En Ruta"
      await CamionRepository.update(
        camion.id_camion,
        { estado: "En Ruta" },
        { transaction }
      );

      // Aquí obtienes claramente los destinos de los pedidos confirmados para este viaje
      /* const estadoConfirmado = await EstadoVentaRepository.findByNombre(
        "Confirmado"
      ); */
      // 5. Obtener pedidos en estado "En Preparación" (modificado aquí)
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
      if (!pedidosEnPreparacion.length)
        throw new Error("No hay pedidos en preparación para este viaje.");

      const destinos = [];
      // Actualizar cada pedido a estado "En Entrega"
      const estadoEnEntrega = await EstadoVentaRepository.findByNombre(
        "En Entrega",
        { transaction }
      );
      if (!estadoEnEntrega)
        throw new Error("Estado 'En Entrega' no configurado.");

      for (const pedido of pedidosEnPreparacion) {
        const cliente = await ClienteRepository.findById(pedido.id_cliente);

        destinos.push({
          id_pedido: pedido.id_pedido,
          id_cliente: cliente.id_cliente,
          nombre_cliente: cliente.nombre_cliente,
          direccion: pedido.direccion_entrega,
          notas: pedido.notas || "",
        });
        await PedidoRepository.update(
          pedido.id_pedido,
          {
            id_estado_pedido: estadoEnEntrega.id_estado_venta,
          },
          { transaction }
        );
      }

      // 5. Crear nueva Agenda de Viaje
      const nuevaAgendaViaje = await AgendaViajesRepository.create(
        {
          id_agenda_carga,
          id_camion: camion.id_camion,
          id_chofer,
          inventario_inicial: productosCargados,
          destinos,
          estado: "En Tránsito",
          fecha_inicio: new Date(),
          notas: `Viaje iniciado. Agenda carga: ${id_agenda_carga}`,
          validado_por_chofer: true,
        },
        { transaction }
      );

      await transaction.commit();

      return {
        message: "Carga confirmada y viaje iniciado con éxito.",
        agendaViaje: nuevaAgendaViaje,
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al confirmar carga: ${error.message}`);
    }
  }

  async getAgendaById(id) {
    const agenda = await AgendaCargaRepository.findById(id);

    if (!agenda) {
      throw new Error("Agenda not found");
    }
    // Procesar inventario del camión
    /* const inventarioProcesado = agenda.camion.inventario.reduce(
      (acc, item) => {
        if (item.estado === "En Camión - Disponible") {
          acc.disponible.push({
            id_producto: item.producto.id_producto,
            nombre: item.producto.nombre_producto,
            cantidad: item.cantidad,
          });
        } else if (item.estado === "En Camión - Reservado") {
          // Buscar el detalle relacionado por `id_detalle_transaccion`
          const detalleRelacionado = agenda.detalles.find(
            (detalle) =>
              detalle.id_detalle_transaccion === item.id_detalle_transaccion
          );

          // Si existe un detalle relacionado, incluir información del cliente
          acc.reservado.push({
            id_producto: item.producto.id_producto,
            nombre: item.producto.nombre_producto,
            cantidad: item.cantidad,
            cliente: detalleRelacionado?.transaccion?.cliente
              ? {
                  nombre: detalleRelacionado.transaccion.cliente.nombre,
                  apellido: detalleRelacionado.transaccion.cliente.apellido,
                  direccion: detalleRelacionado.transaccion.cliente.direccion,
                }
              : {
                  nombre: "Cliente no encontrado",
                  apellido: "",
                  direccion: "",
                },
          });
        }
        return acc;
      },
      { disponible: [], reservado: [] }
    );

    return {
      id_agenda_carga: agenda.id_agenda_carga,
      fechaHora: agenda.fechaHora,
      chofer: {
        rut: agenda.usuario.rut,
        nombre: agenda.usuario.nombre,
        apellido: agenda.usuario.apellido,
        email: agenda.usuario.email,
      },
      camion: {
        id_camion: agenda.camion.id_camion,
        capacidad: agenda.camion.capacidad,
        placa: agenda.camion.placa,
        estado: agenda.camion.estado,
      },
      inventario: inventarioProcesado,
    }; */
    // Obtener los productos asociados a la agenda
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
      where.fechaHora = {
        [Sequelize.Op.gte]: `${options.date} 00:00:00`,
        [Sequelize.Op.lt]: `${options.date} 23:59:59`,
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

  async generarAgendaCargaParaPedidos(id_camion, id_chofer, pedidosIds, rut) {
    const transaction = await sequelize.transaction();
    try {
      const nuevaAgenda = await AgendaCargaRepository.create(
        {
          id_usuario_chofer: id_chofer,
          id_usuario_creador: rut,
          id_camion,
          estado: "Pendiente",
        },
        { transaction }
      );

      for (const id_pedido of pedidosIds) {
        const pedido = await PedidoRepository.findById(id_pedido);
        const detallesPedido = await DetallePedidoRepository.findByPedidoId(
          id_pedido
        );

        for (const detalle of detallesPedido) {
          await AgendaCargaDetalleRepository.create(
            {
              id_agenda_carga: nuevaAgenda.id_agenda_carga,
              id_producto: detalle.id_producto || null,
              id_insumo: detalle.id_insumo || null,
              cantidad: detalle.cantidad,
              estado: "Pendiente",
              notas: pedido.notas || null,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();

      return nuevaAgenda;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al generar agenda de carga: ${error.message}`);
    }
  }

  async confirmarCarga(id_agenda_carga) {
    const transaction = await sequelize.transaction();
    try {
      const agenda = await AgendaCargaRepository.findById(id_agenda_carga);
      const detalles = await AgendaCargaDetalleRepository.findByAgendaId(
        id_agenda_carga
      );

      for (const detalle of detalles) {
        const producto = detalle.id_producto
          ? await ProductosRepository.findById(detalle.id_producto)
          : null;

        // Solo reservas físicamente botellones retornables.
        if (producto && producto.es_retornable) {
          await InventarioCamionRepository.create(
            {
              id_camion: agenda.id_camion,
              id_producto: producto.id_producto,
              cantidad: detalle.cantidad,
              estado: "En Camión - Reservado",
              es_retornable: true,
            },
            { transaction }
          );
        } else {
          // productos no retornables o insumos solo los cargas sin reserva específica.
          await InventarioCamionRepository.create(
            {
              id_camion: agenda.id_camion,
              id_producto: detalle.id_producto,
              id_insumo: detalle.id_insumo,
              cantidad: detalle.cantidad,
              estado: "En Camión - Disponible",
              es_retornable: false,
            },
            { transaction }
          );
        }
        await AgendaCargaDetalleRepository.updateEstado(
          detalle.id_agenda_carga_detalle,
          "Cargado",
          transaction
        );
      }

      await AgendaCargaRepository.updateEstado(
        id_agenda_carga,
        "Cargado",
        transaction
      );

      await transaction.commit();
      return agenda;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al confirmar carga: ${error.message}`);
    }
  }

  /*  async getAgendasByChofer(rut, fecha) {
    const agendas = await AgendaCargaRepository.findAll({
      where: {
        id_usuario_chofer: rut,
        fechaHora: {
          [Sequelize.Op.gte]: `${fecha} 00:00:00`,
          [Sequelize.Op.lt]: `${fecha} 23:59:59`,
        },
      },
      include: [
        {
          model: DetalleTransaccionRepository.getModel(),
          as: "detalles",
          include: [
            {
              model: ProductosRepository.getModel(),
              as: "producto",
            },
            {
              model: TransaccionRepository.getModel(),
              as: "transaccion",
              include: [
                {
                  model: ClienteRepository.getModel(),
                  as: "cliente",
                },
              ],
            },
          ],
        },
        {
          model: CamionRepository.getModel(),
          as: "camion",
        },
      ],
    });
    // Procesar los datos para incluir el cliente en cada detalle
    const agendasConClientes = agendas.map((agenda) => {
      const detallesConClientes = agenda.detalles.map((detalle) => ({
        ...detalle.toJSON(),
        cliente: detalle.transaccion?.cliente
          ? {
              nombre: detalle.transaccion.cliente.nombre,
              apellido: detalle.transaccion.cliente.apellido,
              direccion: detalle.transaccion.cliente.direccion,
            }
          : null,
      }));

      const todosEntregados = detallesConClientes.every(
        (detalle) => detalle.estado_producto_transaccion === 6
      );

      // Actualizar el estado de la agenda si corresponde
      if (todosEntregados && agenda.estado !== "Finalizada") {
        agenda.update({ estado: "Finalizada" }); // Sincronizar con la base de datos
      }

      return {
        ...agenda.toJSON(),
        detalles: detallesConClientes,
      };
    });
    return agendasConClientes;
  } */
  /*  async verificarYFinalizarAgenda(id_agenda_carga) {
    // Buscar la agenda con los detalles asociados
    const agenda = await AgendaCargaRepository.findByPk(id_agenda_carga, {
      include: [
        { model: DetalleTransaccionRepository.getModel(), as: "detalles" },
      ],
    });

    if (!agenda) {
      throw new Error("Agenda no encontrada");
    }

    // Verificar si todos los detalles están en estado "Entregado"
    const detallesPendientes = agenda.detalles.some(
      (detalle) => detalle.estado_producto_transaccion !== 6 // 6 = "Entregado"
    );

    if (!detallesPendientes) {
      // Cambiar el estado de la agenda a "Finalizada"
      await AgendaCargaRepository.update(id_agenda_carga, {
        estado: "Finalizada",
      });
    }
  } */

  async startAgenda(id_agenda_carga) {
    // Buscar la agenda por ID
    const agenda = await AgendaCargaRepository.findById(id_agenda_carga);
    if (!agenda) {
      throw new Error("Agenda no encontrada");
    }

    // Verificar si la agenda ya está en tránsito o finalizada
    if (agenda.estado !== "Pendiente") {
      throw new Error(
        "La agenda no puede iniciar porque no está en estado 'Pendiente'"
      );
    }

    // Verificar el estado del camión de la agenda
    if (agenda.estado_camion !== "Disponible") {
      throw new Error(
        "La agenda no se puede iniciar dado que el camión no está disponible"
      );
    }

    // Cambiar el estado de la agenda a "En tránsito"
    await AgendaCargaRepository.update(agenda.id_agenda_carga, {
      estado: "En tránsito",
      estado_camion: "En Ruta",
    });

    // Cambiar el estado del camión a "En Ruta"
    await CamionRepository.update(agenda.id_camion, {
      estado: "En Ruta",
    });

    return { message: "La agenda ha comenzado y el camión está en ruta" };
  }

  async finalizeAgenda(id_agenda_carga) {
    // Buscar la agenda por ID
    const agenda = await AgendaCargaRepository.findById(id_agenda_carga);
    if (!agenda) {
      throw new Error("Agenda no encontrada");
    }

    // Verificar si la agenda está en tránsito
    if (agenda.estado !== "Finalizada") {
      throw new Error("La agenda no está finalizada");
    }

    // Cambiar el estado de la agenda a "En tránsito"
    await AgendaCargaRepository.update(id_agenda_carga, {
      estado_camion: "Finalizado",
    });

    // Cambiar el estado del camión a "En Ruta"
    await CamionRepository.update(agenda.id_camion, {
      estado: "Disponible",
    });

    return {
      message: "La agenda ha sido finalizada y el camión está disponible",
    };
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

  async updateAgenda(id, data) {
    return await AgendaCargaRepository.update(id, data);
  }

  async deleteAgenda(id) {
    return await AgendaCargaRepository.delete(id);
  }

  async getAgendaActivaPorChofer(rut) {
    return await AgendaCargaRepository.findByChoferAndEstado(
      rut,
      "En tránsito"
    );
  }
}

export default new AgendaCargaService();

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
    const transaction = await sequelize.transaction();

    try {
      // 1. Validar datos obligatorios
      if (!id_usuario_chofer || !id_camion) {
        throw new Error(
          "Faltan datos obligatorios para crear la agenda de carga."
        );
      }
      // 2. Verificar si el chofer existe
      const chofer = await UsuariosRepository.findByRut(id_usuario_chofer);
      if (!chofer) {
        throw new Error("El chofer seleccionado no existe.");
      }

      const camion = await CamionRepository.findById(id_camion);
      if (!camion || camion.estado !== "Disponible") {
        throw new Error("El camión seleccionado no está disponible.");
      }

      if (camion.id_chofer_asignado !== id_usuario_chofer) {
        throw new Error("El chofer no está asignado a este camión.");
      }

      const capacidadMaxima = camion.capacidad;

      // 4. Obtener inventario actual del camión
      const inventarioActual =
        await InventarioCamionService.getInventarioByCamion(id_camion);

      let cantidadActualEnCamion = inventarioActual.reduce(
        (total, item) => total + item.cantidad,
        0
      );

      let espacioDisponible = capacidadMaxima - cantidadActualEnCamion;

      // 5. Opcionalmente descargar productos sobrantes**
      if (descargarRetornables) {
        for (const item of inventarioActual) {
          if (item.estado === "Retornable") {
            await InventarioCamionService.retirarProductoDelCamion(
              id_camion,
              item.id_producto,
              item.cantidad,
              { transaction }
            );
            espacioDisponible += item.cantidad;
          }
        }
      }
      // 8. Ajustar carga del camión según la capacidad y pedidos confirmados
      let productosParaCargar = [];

      for (const producto of productos) {
        if (producto.cantidad > espacioDisponible) {
          throw new Error(
            `No hay suficiente espacio en el camión para cargar: ${producto.notas} - disponible: ${espacioDisponible}.`
          );
        }
        productosParaCargar.push({
          id_producto: producto.id_producto,
          cantidad: producto.cantidad,
          unidad_medida: producto.unidad_medida,
          estado: "Disponible",
          notas: producto.notas,
        });

        espacioDisponible -= producto.cantidad;
      }

      // 7. Crear la agenda de carga
      const fechaHora = new Date();
      const nuevaAgenda = await AgendaCargaRepository.create(
        {
          id_usuario_chofer,
          id_usuario_creador: rut,
          id_camion,
          prioridad,
          estado: "Cargado",
          notas,
          fecha_hora: fechaHora,
        },
        { transaction }
      );

      // 8. Actualizar el inventario del camión
      for (const producto of productosParaCargar) {
        const inventarioBodega =
          await InventarioService.getInventarioByProductoId(
            producto.id_producto
          );
        if (
          !inventarioBodega ||
          inventarioBodega.cantidad < producto.cantidad
        ) {
          throw new Error(
            `Stock insuficiente en bodega para el producto ${producto.id_producto}.`
          );
        }
        await InventarioService.decrementarStock(
          producto.id_producto,
          producto.cantidad,
          { transaction }
        );

        const productoInfo = await ProductosRepository.findById(
          producto.id_producto
        );
        const tipoProducto = productoInfo.es_retornable
          ? "Retornable"
          : "Disponible";

        const productoEnCamion =
          await InventarioCamionService.getProductoEnCamion(
            id_camion,
            producto.id_producto
          );

        if (productoEnCamion) {
          await InventarioCamionService.actualizarProductoEnCamion(
            id_camion,
            producto.id_producto,
            producto.cantidad,
            { transaction }
          );
        } else {
          await InventarioCamionService.addProductToCamion(
            {
              id_camion,
              id_producto: producto.id_producto,
              cantidad: producto.cantidad,
              tipo: tipoProducto,
            },
            {
              transaction,
            }
          );
        }
      }

      // 9. Guardar detalles de la agenda de carga
      await AgendaCargaDetalleRepository.bulkCreate(
        productosParaCargar.map((producto) => ({
          id_agenda_carga: nuevaAgenda.id_agenda_carga,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad,
          unidad_medida: producto.unidad_medida,
          estado: "Pendiente",
          notas: producto.notas || null,
        })),
        { transaction }
      );

      // 14. Confirmar la transacción
      await transaction.commit();

      return nuevaAgenda;
    } catch (error) {
      if (transaction.finished !== "commit") {
        await transaction.rollback();
      }
      throw new Error(`Error al crear la agenda: ${error.message}`);
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

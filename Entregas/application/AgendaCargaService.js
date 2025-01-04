import { literal, Op, Sequelize } from "sequelize";
import InventarioService from "../../inventario/application/InventarioService.js";
import createFilter from "../../shared/utils/helpers.js";
import EstadoDetalleTransaccionService from "../../ventas/application/EstadoDetalleTransaccionService.js";
import DetalleTransaccionRepository from "../../ventas/infrastructure/repositories/DetalleTransaccionRepository.js";
import AgendaCargaRepository from "../infrastructure/repositories/AgendaCargaRepository.js";
import InventarioCamionService from "./InventarioCamionService.js";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import paginate from "../../shared/utils/pagination.js";
import CamionRepository from "../infrastructure/repositories/CamionRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import TransaccionRepository from "../../ventas/infrastructure/repositories/TransaccionRepository.js";
import ClienteRepository from "../../ventas/infrastructure/repositories/ClienteRepository.js";

class AgendaCargaService {
  async createAgenda(
    fecha_hora,
    rut,
    detalles,
    productosAdicionales,
    id_camion
  ) {
    // Validar datos
    if (!fecha_hora) {
      fecha_hora = new Date(); // Genera la fecha y hora actual si no se proporciona
    }
    if (!rut) {
      throw new Error("Faltan datos para agregar agenda");
    }
    const agenda = await AgendaCargaRepository.create({
      fechaHora: fecha_hora,
      id_usuario_chofer: rut,
      id_camion,
    });
    // Nuevo estado en Tránsito - Reservado
    const nuevo_estado = await EstadoDetalleTransaccionService.findByNombre(
      "En tránsito - Reservado"
    );
    // Asignar detalles a la agenda
    if (detalles && detalles.length > 0) {
      await Promise.all(
        detalles.map(async (id_detalle_transaccion) => {
          const detalle = await DetalleTransaccionRepository.findById(
            id_detalle_transaccion
          );
          if (!detalle) {
            throw new Error(
              `Detalle Transaccion con id ${id_detalle_transaccion} no encontrado`
            );
          }
          if (detalle.estado_producto_transaccion === 3) {
            throw new Error(
              "Ya se encuentran en el camión los productos reservados"
            );
          }
          await InventarioService.decrementarStock(
            detalle.id_producto,
            detalle.cantidad
          );
          await DetalleTransaccionRepository.update(id_detalle_transaccion, {
            id_agenda_carga: agenda.id_agenda_carga,
            estado_producto_transaccion:
              nuevo_estado.dataValues.id_estado_detalle_transaccion,
          });
          // Agregar al inventario del camión
          await InventarioCamionService.addProductToCamion(
            {
              id_camion,
              id_producto: detalle.id_producto,
              cantidad: detalle.cantidad,
              id_detalle_transaccion,
            },
            true
          );
        })
      );
    }

    if (productosAdicionales && productosAdicionales.length > 0) {
      // Mover productos adicionales al inventario
      for (const producto of productosAdicionales) {
        const inventario = await InventarioService.getInventarioByProductoId(
          producto.id_producto
        );
        if (!inventario || inventario.cantidad < producto.cantidad) {
          throw new Error(
            `Insufficient stock for product ID ${producto.id_producto}`
          );
        }
        // Falta metodo para disminuir inventario según producto y cantidad
        await InventarioService.decrementarStock(
          producto.id_producto,
          producto.cantidad
        );

        // Falta repositorio camion
        await InventarioCamionService.addProductToCamion({
          id_camion,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad,
        });
      }
    }

    // Crear la agenda
    return agenda;
  }

  async getAgendaById(id) {
    const agenda = await AgendaCargaRepository.findById(id);

    if (!agenda) {
      throw new Error("Agenda not found");
    }
    // Procesar inventario del camión
    const inventarioProcesado = agenda.camion.inventario.reduce(
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
      {
        model: DetalleTransaccionRepository.getModel(),
        as: "detalles",
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

  async getAgendasByChofer(rut, fecha) {
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
  }
  async verificarYFinalizarAgenda(id_agenda_carga) {
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
  }

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
    /* await AgendaCargaRepository.update(agenda.id_agenda_carga, {
      estado: "Finalizada",
    }); */

    // Cambiar el estado del camión a "En Ruta"
    await CamionRepository.update(agenda.id_camion, {
      estado: "Disponible",
    });

    return {
      message: "La agenda ha sido finalizada y el camión está disponible",
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

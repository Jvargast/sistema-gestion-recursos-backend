import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import sequelize from "../../database/database.js";
import AgendaViajesRepository from "../infrastructure/repositories/AgendaViajesRepository.js";
import CamionRepository from "../infrastructure/repositories/CamionRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import InventarioCamionService from "./InventarioCamionService.js";

class AgendaViajesService {
  async getAllViajes() {
    try {
      const choferesDisponibles =
        await AgendaViajesRepository.getChoferesEnTransito();

      const choferesConInventario = choferesDisponibles.filter(
        (chofer) => chofer.camion?.inventario?.length > 0
      );

      if (choferesConInventario.length === 0) {
        throw new Error(
          "No hay choferes con inventario disponible en tránsito."
        );
      }

      return choferesConInventario;
    } catch (error) {
      console.error("Error en AgendaViajesService:", error);
      throw new Error(error.message);
    }
  }

  async getViajeByChoferId(id_chofer) {
    const usuario = UsuariosRepository.findByRut(id_chofer);
    if (!usuario) throw Error(`No existe usuario con el id: ${id_chofer}`);

    const viaje = await AgendaViajesRepository.findByChoferAndEstado(id_chofer, "En Tránsito");
    if(!viaje) throw Error(`No existe viaje con el id del chofer: ${id_chofer}`);

    return viaje;
  }

  async finalizarViaje(id_agenda_viaje, choferRut, descargarDisponibles) {
    const transaction = await sequelize.transaction();
    try {
      const agenda = await AgendaViajesRepository.findByAgendaViajeId(
        id_agenda_viaje,
        {
          transaction,
        }
      );
      if (!agenda) {
        throw new Error("Agenda de viaje no encontrada.");
      }
      if (agenda.estado !== "En Tránsito") {
        throw new Error(
          `No se puede finalizar un viaje en estado: ${agenda.estado}`
        );
      }
      if (choferRut && agenda.id_chofer !== choferRut) {
        throw new Error("No autorizado para finalizar este viaje.");
      }

      const camion = await CamionRepository.findById(agenda.id_camion, {
        transaction,
      });
      if (!camion) {
        throw new Error("Camión no encontrado.");
      }

      await InventarioCamionService.descargarItemsCamion(
        camion.id_camion,
        {
          descargarRetorno: true,
          descargarDisponibles,
        },
        transaction
      );

      console.log("SI funcion");
      const inventarioCamion =
        await InventarioCamionRepository.findAllByCamionId(camion.id_camion, {
          transaction,
        });
      const inventarioFinal = inventarioCamion.map((item) => ({
        id_inventario_camion: item.id_inventario_camion,
        id_producto: item.id_producto,
        id_insumo: item.id_insumo,
        cantidad: item.cantidad,
        estado: item.estado,
        es_retornable: item.es_retornable,
      }));

      agenda.inventario_final = inventarioFinal;
      agenda.estado = "Finalizado";
      agenda.fecha_fin = new Date();
      await agenda.save({ transaction });

      camion.estado = "Disponible";
      await camion.save({ transaction });

      await transaction.commit();
      return {
        message: "Viaje finalizado con éxito.",
        agendaViaje: agenda,
      };
    } catch (error) {
      if (transaction.finished !== "commit") {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /* async iniciarViaje(id_agenda_carga, id_chofer) {
    const transaction = await sequelize.transaction();

    try {
      // Verificar la agenda carga esté completada
      const agendaCarga = await AgendaCargaRepository.findById(id_agenda_carga);
      if (!agendaCarga || agendaCarga.estado !== "Completada") {
        throw new Error("La agenda de carga no está lista para iniciar viaje.");
      }

      // Validar chofer asignado
      if (agendaCarga.id_usuario_chofer !== id_chofer) {
        throw new Error("Este chofer no está asignado a esta carga.");
      }

      // Obtener pedidos asignados al chofer en estado confirmado
      const estadoConfirmado = await EstadoVentaRepository.findByNombre(
        "Confirmado"
      );
      const pedidosConfirmados =
        await PedidoRepository.findAllByChoferAndEstado(
          id_chofer,
          estadoConfirmado.id_estado_venta
        );

      if (!pedidosConfirmados.length) {
        throw new Error("No hay pedidos confirmados asignados al chofer.");
      }

      // Generar destinos desde pedidos
      const destinos = pedidosConfirmados.map((pedido) => ({
        id_pedido: pedido.id_pedido,
        cliente: pedido.cliente.nombre_cliente,
        direccion: pedido.direccion_entrega,
        estado: "Pendiente",
      }));

      // Crear la agenda viaje
      const agendaViaje = await AgendaViajesRepository.create(
        {
          id_agenda_carga,
          id_camion: agendaCarga.id_camion,
          id_chofer,
          inventario_inicial:
            await InventarioCamionService.getInventarioByCamion(
              agendaCarga.id_camion
            ),
          destinos,
          estado: "En Tránsito",
          fecha_inicio: new Date(),
          notas: `Viaje iniciado desde agenda carga ${id_agenda_carga}.`,
          validado_por_chofer: true,
        },
        { transaction }
      );

      // Actualizar estado del camión
      await CamionRepository.update(
        agendaCarga.id_camion,
        { estado: "En Ruta" },
        { transaction }
      );

      await transaction.commit();

      return agendaViaje;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al iniciar viaje: ${error.message}`);
    }
  } */
}

export default new AgendaViajesService();

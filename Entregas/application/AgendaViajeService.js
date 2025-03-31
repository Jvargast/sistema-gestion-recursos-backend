import { Op } from "sequelize";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import sequelize from "../../database/database.js";
import AgendaViajesRepository from "../infrastructure/repositories/AgendaViajesRepository.js";
import CamionRepository from "../infrastructure/repositories/CamionRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import InventarioCamionService from "./InventarioCamionService.js";
import CajaRepository from "../../ventas/infrastructure/repositories/CajaRepository.js";
import HistorialCajaRepository from "../../ventas/infrastructure/repositories/HistorialCajaRepository.js";

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

    const viaje = await AgendaViajesRepository.findByChoferAndEstado(
      id_chofer,
      "En Tránsito"
    );
    if (!viaje)
      throw Error(`No existe viaje con el id del chofer: ${id_chofer}`);

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

      const cajaAsignada = await CajaRepository.findByAsignado(choferRut, {
        transaction,
      });
      if (!cajaAsignada) {
        throw new Error("No se encontró la caja asignada para cerrar.");
      }

      await InventarioCamionService.descargarItemsCamion(
        camion.id_camion,
        {
          descargarRetorno: true,
          descargarDisponibles,
        },
        transaction
      );

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

      await HistorialCajaRepository.create(
        {
          id_caja: cajaAsignada.id_caja,
          id_sucursal: cajaAsignada.id_sucursal,
          fecha_cierre: new Date(),
          saldo_final: cajaAsignada.saldo_final,
          usuario_cierre: choferRut,
          observaciones: `Cierre de caja registrado el ${new Date().toLocaleString()}`,
        },
        { transaction }
      );

      await CajaRepository.update(
        cajaAsignada.id_caja,
        {
          estado: "cerrada",
          fecha_cierre: new Date(),
          saldo_final: null,
        },
        { transaction }
      );

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

  async getHistorialViajesChofer(id_chofer) {
    const viajes = await AgendaViajesRepository.findWithConditions({
      where: {
        id_chofer,
        estado: {
          [Op.notIn]: ["Pendiente", "En Tránsito"],
        },
      },
      include: [
        {
          model: CamionRepository.getModel(),
          as: "camion",
          attributes: ["placa", "capacidad"],
        },
        // Puedes agregar otros modelos relacionados
      ],
      order: [["fecha_inicio", "DESC"]],
    });

    return viajes;
  }

  async getHistorialViajes() {
    try {
      const viajes = await AgendaViajesRepository.getAll();
      return viajes;
    } catch (error) {
      console.error("Error al obtener historial de viajes:", error);
      throw new Error("No se pudo obtener el historial de viajes.");
    }
  }
}

export default new AgendaViajesService();

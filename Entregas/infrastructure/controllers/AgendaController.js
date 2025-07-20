import {
  obtenerFechaChile,
  obtenerLimitesUTCParaDiaChile,
} from "../../../shared/utils/fechaUtils.js";
import AgendaCargaService from "../../application/AgendaCargaService.js";

class AgendaCargaController {
  async getAllAgendas(req, res) {
    try {
      const filters = req.query;

      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
      };

      const agendas = await AgendaCargaService.findAll(filters, options);
      res.status(200).json({ data: agendas.data, total: agendas.pagination });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener agendas de carga" });
    }
  }

  async createAgenda(req, res) {
    try {
      const {
        id_usuario_chofer,
        id_camion,
        prioridad,
        notas,
        productos,
        descargarRetornables,
      } = req.body;
      const rut = req.user.id;

      const nuevaAgenda = await AgendaCargaService.createAgenda(
        id_usuario_chofer,
        rut,
        id_camion,
        prioridad,
        notas,
        productos,
        descargarRetornables
      );
      res.status(201).json(nuevaAgenda);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async confirmarCargaCamion(req, res) {
    try {
      const {
        id_agenda_carga,
        productosCargados,
        notasChofer,
        origen_inicial,
      } = req.body;
      const id_chofer = req.user.id;
      const carga = await AgendaCargaService.confirmarCargaCamion(
        id_agenda_carga,
        id_chofer,
        productosCargados,
        notasChofer,
        origen_inicial
      );
      res.status(201).json(carga);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAgendaById(req, res) {
    try {
      const { id } = req.params;
      const agenda = await AgendaCargaService.getAgendaById(id);
      res.status(200).json(agenda);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const filters = req.query;
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 20) || 20,
        search: req.query.search,
        date: req.query.date,
        creador: req.user,
      };
      delete filters.limit;
      delete filters.offset;
      const agendas = await AgendaCargaService.getAllAgendas(filters, options);
      res.status(200).json({ data: agendas.data, total: agendas.pagination });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedAgenda = await AgendaCargaService.updateAgenda(id, data);
      res.status(200).json(updatedAgenda);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await AgendaCargaService.deleteAgenda(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAgendaCargaDelDia(req, res) {
    try {
      const id_chofer = req.user.id;
      const fechaFormateada = obtenerFechaChile("YYYY-MM-DD");
      const [inicioUTC, finUTC] =
        obtenerLimitesUTCParaDiaChile(fechaFormateada);

      const agenda = await AgendaCargaService.getAgendaCargaDelDia(
        id_chofer,
        inicioUTC,
        finUTC
      );

      if (!agenda || agenda.length === 0) {
        return res
          .status(404)
          .json({ message: "No hay agenda de carga pendiente para hoy." });
      }

      res.status(200).json({ data: agenda });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new AgendaCargaController();

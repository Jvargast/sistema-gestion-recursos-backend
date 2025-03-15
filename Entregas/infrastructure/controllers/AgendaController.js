import AgendaCargaService from "../../application/AgendaCargaService.js";

class AgendaCargaController {
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
      const { id_agenda_carga, productosCargados, notasChofer } = req.body;
      const id_chofer = req.user.id;
      const carga = await AgendaCargaService.confirmarCargaCamion(
        id_agenda_carga,
        id_chofer,
        productosCargados,
        notasChofer
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

  async getAgendasByChofer(req, res) {
    try {
      const rut = req.user.id;
      const { estado } = req.query;
      const { fecha = new Date().toISOString().split("T")[0] } = req.query; // Por defecto, agendas del día actual

      // Llamar al servicio para obtener las agendas del chofer
      const agendas = await AgendaCargaService.getAgendasByChofer(
        rut,
        fecha,
        estado
      );

      // Separar las agendas por estado
      const agendasPendientes = agendas.filter(
        (agenda) => agenda.estado === "Pendiente"
      );
      const agendasEnTransito = agendas.filter(
        (agenda) => agenda.estado === "En tránsito"
      );
      const agendasFinalizadas = agendas.filter(
        (agenda) => agenda.estado === "Finalizada"
      );
      // const agendas = await AgendaCargaService.getAgendasByChofer(rut, estado);
      res
        .status(200)
        .json({ agendasPendientes, agendasEnTransito, agendasFinalizadas });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  async getAgendaActiva(req, res) {
    try {
      const rut = req.user.id; // Obtener el RUT del chofer desde el token o sesión

      if (!rut) {
        return res.status(400).json({ error: "RUT del usuario es requerido." });
      }
      const agenda = await AgendaCargaService.getAgendaActivaPorChofer(rut);

      if (!agenda) {
        return res
          .status(404)
          .json({ error: "No tienes una agenda activa asociada." });
      }

      return res.status(200).json({ data: agenda });
    } catch (error) {
      console.error("Error al obtener la agenda activa:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  async startAgenda(req, res) {
    try {
      const { id } = req.params;

      const response = await AgendaCargaService.startAgenda(id);

      res.status(200).json(response);
    } catch (error) {
      console.error("Error al iniciar la agenda:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async finalizeAgenda(req, res) {
    try {
      const { id } = req.params;

      const response = await AgendaCargaService.finalizeAgenda(id);

      res.status(200).json(response);
    } catch (error) {
      console.error("Error al finalizar la agenda:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
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
}

export default new AgendaCargaController();

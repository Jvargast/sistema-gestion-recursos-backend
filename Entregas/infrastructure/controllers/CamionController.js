import CamionService from "../../application/CamionService.js";

class CamionController {
  async create(req, res) {
    try {
      const data = req.body;
      const camion = await CamionService.createCamion(data);
      res.status(201).json(camion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const camion = await CamionService.getCamionById(id);
      res.status(200).json(camion);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const camiones = await CamionService.getAllCamiones();
      res.status(200).json(camiones);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCamionCapacity(req, res) {
    try {
      const { id_camion } = req.params;

      const capacityInfo = await CamionService.getCurrentCapacity(id_camion);

      res.status(200).json(capacityInfo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCamionCapacityByChoferId(req, res) {
    try {
      const { id_chofer } = req.params;
      const capacidad = await CamionService.getCapacityByChoferId(id_chofer);

      res.status(200).json(capacidad);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async asignarChofer(req, res) {
    try {
      const { id } = req.params;
      const { id_chofer } = req.body;

      const camionActualizado = await CamionService.asignarChofer(
        id,
        id_chofer
      );

      res.status(200).json({
        mensaje: "Chofer asignado correctamente al camión",
        camion: camionActualizado,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async desasignarChofer(req, res) {
    try {
      const { id } = req.params;
      const camionActualizado = await CamionService.desasignarChofer(id);

      res.status(200).json({
        mensaje: "Chofer desasignado con éxito.",
        camion: camionActualizado,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedCamion = await CamionService.updateCamion(id, data);
      res.status(200).json(updatedCamion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await CamionService.deleteCamion(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CamionController();

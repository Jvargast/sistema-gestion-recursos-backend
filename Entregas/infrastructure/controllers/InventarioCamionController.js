import AgendaCargaService from "../../application/AgendaCargaService.js";
import InventarioCamionService from "../../application/InventarioCamionService.js";

class InventarioCamionController {
  async addProduct(req, res) {
    try {
      const data = req.body;
      const producto = await InventarioCamionService.addProductToCamion(data);
      res.status(201).json(producto);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProductsByCamion(req, res) {
    try {
      const { id } = req.params;
      const productos = await InventarioCamionService.getProductsByCamion(id);
      res.status(200).json(productos);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async returnProducts(req, res) {
    try {
      const { id } = req.params;
      const result = await InventarioCamionService.retornarProductosAdicionales(
        id
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  async getInventarioDisponible(req, res) {
    try {
      const { id_camion, search = "" } = req.query;

      if (!id_camion) {
        return res
          .status(400)
          .json({ message: "El ID del camión es requerido." });
      }

      const inventario = await InventarioCamionService.getInventarioDisponible(
        id_camion, search
      );

      res.status(200).json({ data: inventario });
    } catch (error) {
      console.error("Error al obtener el inventario disponible:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async getInventarioDisponiblePorChofer(req, res) {
    try {
      const { rut } = req.user; // Obtener el RUT del chofer desde el token o sesión

      if (!rut) {
        return res.status(400).json({ error: "RUT del usuario es requerido." });
      }

      // Obtener la agenda activa del chofer
      const agenda = await AgendaCargaService.getAgendaActivaPorChofer(rut);

      if (!agenda) {
        return res
          .status(404)
          .json({ error: "No tienes una agenda activa asociada." });
      }

      // Obtener el inventario disponible del camión
      const inventario = await InventarioCamionService.getInventarioDisponible(
        agenda.id_camion
      );

      return res.status(200).json({ data: inventario });
    } catch (error) {
      console.error("Error al obtener inventario disponible:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new InventarioCamionController();

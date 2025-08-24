import AgendaCargaService from "../../application/AgendaCargaService.js";
import InventarioCamionService from "../../application/InventarioCamionService.js";
import CamionRepository from "../repositories/CamionRepository.js";

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
      let { id_camion } = req.params;

      if (!id_camion || isNaN(parseInt(id_camion))) {
        return res.status(400).json({
          message: "El ID del camión es requerido y debe ser un número.",
        });
      }

      id_camion = parseInt(id_camion);

      const inventario = await InventarioCamionService.getInventarioDisponible(
        id_camion
      );

      res.status(200).json({ data: inventario });
    } catch (error) {
      console.error("Error al obtener el inventario disponible:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async getInventarioDisponiblePorChofer(req, res) {
    try {
      const { id } = req.user; // Obtener el RUT del chofer desde el token o sesión

      if (!id) {
        return res.status(400).json({ error: "RUT del usuario es requerido." });
      }

      // Obtener la agenda activa del chofer
      const agenda = await AgendaCargaService.getAgendaActivaPorChofer(id);

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
  async getEstadoInventarioCamion(req, res) {
    try {
      let { id_camion } = req.params;

      if (!id_camion || isNaN(parseInt(id_camion))) {
        return res.status(400).json({
          message: "El ID del camión es requerido y debe ser un número.",
        });
      }

      id_camion = parseInt(id_camion);

      // Llamar al servicio para obtener el inventario en uso y disponible
      const inventarioEstado =
        await InventarioCamionService.getEstadoInventario(id_camion);

      res.status(200).json({ data: inventarioEstado });
    } catch (error) {
      console.error(
        "Error al obtener el estado del inventario del camión:",
        error
      );
      res.status(500).json({ message: error.message });
    }
  }

  async getInventarioPorChofer(req, res) {
    try {
      const { id_chofer } = req.params;

      if (!id_chofer) {
        return res.status(400).json({
          message: "El ID del chofer es requerido y debe ser un número.",
        });
      }

      const inventario = await InventarioCamionService.getInventarioPorChofer(
        id_chofer
      );

      res.status(200).json({ data: inventario });
    } catch (error) {
      console.error("Error al obtener el inventario del camión:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async vaciarCamion(req, res) {
    try {
      const { id_camion } = req.params;
      const { descargarDisponibles = true, descargarRetorno = true } =
        req.body || {};

      const camion = await CamionRepository.findById(id_camion);
      if (!camion)
        return res.status(404).json({ error: "Camión no encontrado" });
      if (!camion.id_sucursal) {
        return res
          .status(400)
          .json({ error: "El camión no tiene id_sucursal asignado" });
      }

      const result = await InventarioCamionService.vaciarCamion(id_camion, {
        id_sucursal: camion.id_sucursal,
        descargarDisponibles,
        descargarRetorno,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Error al vaciar camión:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

export default new InventarioCamionController();

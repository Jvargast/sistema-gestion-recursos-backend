import CotizacionService from "../../application/CotizacionService.js";


class CotizacionController {
  // Crear una nueva cotización
  async createCotizacion(req, res) {
    try {
      const cotizacionData = req.body; // Datos enviados desde el frontend
      const rut = req.user.id; // Asumiendo que el usuario está autenticado y su RUT está en req.user
      const {cotizacion, detalles} = await CotizacionService.createCotizacion(
        cotizacionData,
        rut
      );

      res
        .status(201)
        .json({ message: "Cotización creada exitosamente", cotizacion, detalles });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Obtener una cotización por su ID
  async getCotizacionById(req, res) {
    try {
      const { id } = req.params; // ID de la cotización enviado en la URL
      const cotizacion = await CotizacionService.getCotizacionById(id);

      if (!cotizacion) {
        return res.status(404).json({ error: "Cotización no encontrada" });
      }

      res.status(200).json(cotizacion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener todas las cotizaciones con filtros y paginación
  async getAllCotizaciones(req, res) {
    try {
      const filters = req.query; // Filtros enviados en la URL como query params
      const options = {
        page: parseInt(req.query.page, 10) || 1, // Página actual
        limit: parseInt(req.query.limit, 10) || 10, // Límite de resultados por página
      };

      delete filters.page; // Eliminar filtros no válidos
      delete filters.limit;

      const cotizaciones = await CotizacionService.getAllCotizaciones(
        filters,
        options
      );

      res.status(200).json({
        data: cotizaciones.data, // Cotizaciones encontradas
        total: cotizaciones.pagination, // Información de la paginación
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Actualizar una cotización existente
  async updateCotizacion(req, res) {
    try {
      const { id } = req.params; // ID de la cotización enviada en la URL
      const updateData = req.body; // Datos enviados desde el frontend
      const updatedCotizacion = await CotizacionService.updateCotizacion(
        id,
        updateData
      );

      if (!updatedCotizacion) {
        return res
          .status(404)
          .json({ error: "Cotización no encontrada o no actualizada" });
      }

      res
        .status(200)
        .json({ message: "Cotización actualizada exitosamente", updatedCotizacion });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Eliminar una cotización
  async deleteCotizacion(req, res) {
    try {
      const { id } = req.params; // ID de la cotización enviada en la URL
      const deleted = await CotizacionService.deleteCotizacion(id);

      if (!deleted) {
        return res
          .status(404)
          .json({ error: "Cotización no encontrada o no eliminada" });
      }

      res.status(200).json({ message: "Cotización eliminada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new CotizacionController();

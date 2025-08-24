import CotizacionService from "../../application/CotizacionService.js";

class CotizacionController {
  async createCotizacion(req, res) {
    try {
      const cotizacionData = req.body;
      const rut = req.user.id; 
      const { cotizacion, detalles } = await CotizacionService.createCotizacion(
        cotizacionData,
        rut
      );

      res.status(201).json({
        message: "Cotización creada exitosamente",
        cotizacion,
        detalles,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCotizacionById(req, res) {
    try {
      const { id } = req.params; 
      const cotizacion = await CotizacionService.getCotizacionById(id);

      if (!cotizacion) {
        return res.status(404).json({ error: "Cotización no encontrada" });
      }

      res.status(200).json(cotizacion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllCotizaciones(req, res) {
    try {
      const filters = req.query; 
      const options = {
        page: parseInt(req.query.page, 10) || 1, 
        limit: parseInt(req.query.limit, 10) || 10,
      };

      delete filters.page; 
      delete filters.limit;

      const cotizaciones = await CotizacionService.getAllCotizaciones(
        filters,
        options
      );

      res.status(200).json({
        data: cotizaciones.data, 
        total: cotizaciones.pagination,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCotizacion(req, res) {
    try {
      const { id } = req.params; 
      const updateData = req.body; 
      const updatedCotizacion = await CotizacionService.updateCotizacion(
        id,
        updateData
      );

      if (!updatedCotizacion) {
        return res
          .status(404)
          .json({ error: "Cotización no encontrada o no actualizada" });
      }

      res.status(200).json({
        message: "Cotización actualizada exitosamente",
        updatedCotizacion,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCotizacion(req, res) {
    try {
      const { id } = req.params; 
      const rut = req.user?.id;
      const deleted = await CotizacionService.deleteCotizacion(id, rut);

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

  async generarPdfCotizacion(req, res) {
    try {
      const { id } = req.params;

      const mostrarImpuestos = req.query.mostrar_impuestos === "true";

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=cotizacion_${id}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");

      await CotizacionService.generarCotizacionPdf(id, res, mostrarImpuestos);
    } catch (error) {
      console.error("Error al generar PDF de cotización:", error);
      res.status(500).json({ error: error.message || "Error al generar PDF" });
    }
  }

  async actualizarCotizacion(req, res) {
    const { id } = req.params;
    const {
      impuesto,
      descuento_total_porcentaje,
      notas,
      fecha_vencimiento,
      detalles_actualizados,
    } = req.body;

    try {
      const cotizacionActualizada =
        await CotizacionService.actualizarCotizacion(
          id,
          impuesto,
          descuento_total_porcentaje,
          notas,
          fecha_vencimiento,
          detalles_actualizados 
        );

      return res.json({ cotizacion: cotizacionActualizada });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ message: error.message || "Error al actualizar cotización" });
    }
  }
}

export default new CotizacionController();

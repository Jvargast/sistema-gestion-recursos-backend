import FacturaService from "../../application/FacturaService.js";

class FacturaController {
  // Obtener una factura por ID
  async getFacturaById(req, res) {
    try {
      const { id } = req.params;
      const factura = await FacturaService.getFacturaById(id);
      res.status(200).json(factura);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Obtener todas las facturas con filtros y paginación
  async getAllFacturas(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
        estado: req.query.estado,
      };
      delete filters.page;
      delete filters.limit;

      const facturas = await FacturaService.getAllFacturas(filters, options);
      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Crear una factura desde una transacción
  async crearFacturaDesdeTransaccion(req, res) {
    try {
      const { id_transaccion } = req.body;
      const factura = await FacturaService.crearFacturaDesdeTransaccion(
        id_transaccion,
        req.body
      );
      res.status(201).json(factura);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Crear una factura independiente
  async crearFacturaIndependiente(req, res) {
    try {
      const factura = await FacturaService.crearFacturaIndependiente(req.body);
      res.status(201).json(factura);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Actualizar estado de una factura
  async actualizarEstadoFactura(req, res) {
    try {
      const { id } = req.params;
      const { estado_factura } = req.body;
      const factura = await FacturaService.actualizarEstadoFactura(
        id,
        estado_factura
      );
      res.status(200).json(factura);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  // Actualizar factura
  async actualizarFactura(req, res) {
    try {
      const { id } = req.params;
      const factura = await FacturaService.updateFactura(id, req.body);
      res.status(200).json(factura);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Eliminar una factura (borrado lógico)
  async eliminarFactura(req, res) {
    try {
      const { id } = req.params;
      const factura = await FacturaService.eliminarFactura(id);
      res.status(200).json(factura);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new FacturaController();

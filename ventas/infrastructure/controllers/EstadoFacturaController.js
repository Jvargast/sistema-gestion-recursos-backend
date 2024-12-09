import EstadoFacturaService from "../../application/EstadoFacturaService.js";

class EstadoFacturaController {
  async getAllEstadosFactura(req, res) {
    try {
      const estados = await EstadoFacturaService.getAllEstados();
      res.status(200).json(estados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new EstadoFacturaController();

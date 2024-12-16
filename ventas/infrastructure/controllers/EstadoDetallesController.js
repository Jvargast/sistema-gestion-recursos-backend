import EstadoDetalleTransaccionService from "../../application/EstadoDetalleTransaccionService.js";

class EstadoDetallesController {
  async getEstadosDetalle(req, res) {
    try {
      const estados = await EstadoDetalleTransaccionService.getAllEstados(); 
      res.status(200).json(estados);
    } catch (error) {
      console.error("Error al obtener los estados del detalle:", error);
      res.status(500).json({
        message: "Hubo un error al obtener los estados del detalle.",
      });
    }
  }
}

export default new EstadoDetallesController();

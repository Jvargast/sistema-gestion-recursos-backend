import EstadoVentaRepository from "../repositories/EstadoVentaRepository.js";

class EstadoVentaController {
  async getEstadoVentaById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ error: "El ID del estado venta es obligatorio." });
      }

      const estado_venta = await EstadoVentaRepository.findById(id);
      if (!estado_venta) {
        return res.status(404).json({ error: "Estado venta no encontrado" });
      }

      res.status(200).json(estado_venta);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error interno del servidor: ${error.message}` });
    }
  }

  async getAllEstadosVentas(req, res) {
    try {
      const estados_ventas = await EstadoVentaRepository.findAll();
      res.status(200).json(estados_ventas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new EstadoVentaController();

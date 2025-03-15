import VentaChoferService from "../../application/VentaChoferService.js";

class VentaChoferController {
  /**
   * Controlador para manejar la venta rápida.
   * @param {Object} req - Objeto de solicitud HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   */
  async realizarVentaRapida(req, res) {
    try {
      const {
        id_cliente,
        productos,
        id_metodo_pago,
        retornables_recibidos,
        estadoPago,
        monto_recibido,
      } = req.body;
      const rut = req.user.id;
      // Llamar al servicio
      const resultado = await VentaChoferService.realizarVentaChofer(
        rut,
        id_cliente,
        id_metodo_pago,
        productos,
        retornables_recibidos,
        estadoPago,
        monto_recibido
      );

      return res.status(201).json(resultado);
    } catch (error) {
      console.error("Error en realizar Venta Rapida:", error.message);
      return res.status(500).json({
        error: "Ocurrió un error al realizar la venta rápida.",
        detalle: error.message,
      });
    }
  }
  async getVentasChofer(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const rut = req.user.id; // Obtener el RUT del chofer autenticado
      const rol = req.user.rol; // Obtener el rol del usuario autenticado
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
      };

      // Si el usuario es chofer, solo mostrar sus ventas
      if (rol === "chofer") {
        options.id_chofer = rut;
      }

      const ventas = await VentaChoferService.getVentasChofer(filters, options);

      res.status(200).json({
        data: ventas.data,
        total: ventas.pagination,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new VentaChoferController();

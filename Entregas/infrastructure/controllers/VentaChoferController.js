import VentaChoferService from "../../application/VentaChoferService.js";

class VentaChoferController {
  /**
   * Controlador para manejar la venta rápida.
   * @param {Object} req - Objeto de solicitud HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   */
  async realizarVentaRapida(req, res) {
    try {
      const { id_camion, cliente_rut, productos, metodo_pago, monto, referencia } =
        req.body;
      const rut = req.user.id;
      // Validar datos de entrada
      if (
        !id_camion ||
        !cliente_rut ||
        !productos ||
        productos.length === 0 ||
        !metodo_pago ||
        !referencia
      ) {
        return res.status(400).json({
          error: "Faltan datos obligatorios para realizar la venta rápida.",
        });
      }

      // Llamar al servicio
      const resultado = await VentaChoferService.realizarVentaRapida(
        id_camion,
        cliente_rut,
        productos,
        metodo_pago,
        monto,
        referencia,
        rut
      );

      // Responder al cliente
      return res.status(201).json({
        message: resultado.message,
        venta: resultado.venta,
        documento: resultado.documento,
        boleta: resultado.boleta,
      });
    } catch (error) {
      console.error("Error en realizarVentaRapida:", error.message);
      return res.status(500).json({
        error: "Ocurrió un error al realizar la venta rápida.",
        detalle: error.message,
      });
    }
  }
  async getVentasChofer(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const rut  = req.user.id; // Obtener el RUT del chofer autenticado
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

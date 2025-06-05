import ProduccionService from "../../application/ProduccionService.js";

class ProduccionController {
  constructor() {
    this.produccion = new ProduccionService();
  }
  async registrarProduccion(req, res) {
    try {
      const { id_formula, cantidad_lote } = req.body;
      const rut_usuario = req.user?.id;

      const resultado = await this.produccion.crear({
        id_formula,
        cantidad_lote,
        rut_usuario,
      });

      res.status(201).json(resultado);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }

  async listarProducciones(req, res) {
    try {
      const prods = await this.produccion.listar(req.query);
      res.json({
        data: prods.data,
        paginacion: prods.pagination,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async obtenerProduccion(req, res) {
    try {
      const prod = await this.produccion.detalle(req.params.id);
      if (!prod)
        return res.status(404).json({ error: "Producción no encontrada" });
      res.json(prod);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default ProduccionController;

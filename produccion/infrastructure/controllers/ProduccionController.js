import ProduccionService from "../../application/ProduccionService.js";

class ProduccionController {
  constructor() {
    this.produccion = new ProduccionService();
  }
  async registrarProduccion(req, res) {
    try {
      const { id_formula, cantidad_lote, id_sucursal, insumos_consumidos } =
        req.body;
      const rut_usuario = req.user?.id;

      const resultado = await this.produccion.crear({
        id_formula,
        cantidad_lote,
        id_sucursal,
        rut_usuario,
        insumos_consumidos,
      });

      res.status(201).json(resultado);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }

  async listarProducciones(req, res) {
    try {
      const filters = { ...req.query };
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
        search: req.query.search || undefined,
        fecha: req.query.fecha || undefined, 
      };
      delete filters.page;
      delete filters.limit;
      delete filters.search;
      delete filters.fecha;

      const prods = await this.produccion.listar(filters, options);

      res.status(200).json({
        producciones: prods.data,
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

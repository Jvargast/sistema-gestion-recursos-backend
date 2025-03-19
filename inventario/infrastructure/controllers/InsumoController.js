import InsumoService from "../../application/InsumoService.js";

class InsumoController {
  async getInsumoById(req, res) {
    try {
      const { id } = req.params;
      const insumo = await InsumoService.getInsumoById(id);
      res.status(200).json(insumo);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllInsumos(req, res) {
    try {
      const filters = req.query;
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 20) || 20,
        search: req.query.search,
        tipo: req.query.tipo,
      };
      delete filters.limit;
      delete filters.offset;

      const insumos = await InsumoService.getAllInsumos(filters, options);
      res.status(200).json({ data: insumos });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllInsumosVendibles(req, res) {
    try {
      const filters = req.query;
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 20) || 20,
        search: req.query.search,
        tipo: req.query.tipo,
      };
      delete filters.limit;
      delete filters.offset;

      const insumos = await InsumoService.getAllInsumosVendibles(filters, options);
      res.status(200).json({ data: insumos });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createInsumo(req, res) {
    try {
      const data = req.body;
      const insumo = await InsumoService.createInsumo(data);
      res.status(201).json(insumo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateInsumo(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedInsumo = await InsumoService.updateInsumo(id, data);
      res.status(200).json(updatedInsumo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteInsumo(req, res) {
    try {
      const { ids } = req.body; // Asegúrate de que los IDs se envíen en el cuerpo
      console.log("IDs recibidos:", ids);
      // Validar que sea un array y convertir los elementos a números
      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ error: "Debes proporcionar una lista de IDs." });
      }


      const result = await InsumoService.deleteInsumos(ids);
      res.status(200).json({ message: "Insumos eliminados con éxito", result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new InsumoController();

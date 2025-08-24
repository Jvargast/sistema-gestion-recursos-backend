import FormulaProductoService from "../../application/FormulaProductoService.js";

class FormulaProductoController {
  static async getAllFormulas(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        nombre_formula,
        id_producto_final,
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const filters = {};
      if (nombre_formula) filters.nombre_formula = nombre_formula;
      if (id_producto_final) filters.id_producto_final = id_producto_final;

      const formulas = await FormulaProductoService.getAllFormulas(
        options,
        filters
      );
      res.status(200).json(formulas);
    } catch (error) {
      console.error("Error en getAllFormulas:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getFormulasByProductoId(req, res) {
    const { id_producto } = req.params;
    try {
      const formulas = await FormulaProductoService.getFormulasByProductoId(
        id_producto
      );
      res.status(200).json(formulas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFormulaById(req, res) {
    const { id } = req.params;
    const idSucursal = req.query?.id_sucursal
      ? Number(req.query.id_sucursal)
      : undefined;
    try {
      const formula = await FormulaProductoService.getFormulaById(
        id,
        idSucursal
      );
      if (!formula) {
        return res.status(404).json({ error: "Fórmula no encontrada" });
      }
      res.status(200).json(formula);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createFormula(req, res) {
    const formulaData = req.body;
    try {
      const nuevaFormula = await FormulaProductoService.createFormula(
        formulaData
      );
      res.status(201).json(nuevaFormula);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateFormula(req, res) {
    const { id } = req.params;
    const formulaData = req.body;
    try {
      const updatedFormula = await FormulaProductoService.updateFormula(
        id,
        formulaData
      );
      if (!updatedFormula) {
        return res.status(404).json({ error: "Fórmula no encontrada" });
      }
      res.status(200).json(updatedFormula);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteFormula(req, res) {
    const { id } = req.params;
    try {
      const deleted = await FormulaProductoService.deleteFormula(id);
      if (!deleted) {
        return res.status(404).json({ error: "Fórmula no encontrada" });
      }
      res.status(200).json({ message: "Fórmula eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default FormulaProductoController;

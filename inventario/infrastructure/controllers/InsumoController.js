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

  async getStocksForInsumos(req, res) {
    try {
      const { ids, id_sucursal } = req.query;

      if (!ids) {
        return res
          .status(400)
          .json({ error: "El parámetro 'ids' es requerido (coma-separado)." });
      }

      const idList = String(ids)
        .split(",")
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n));

      if (idList.length === 0) {
        return res
          .status(400)
          .json({ error: "El parámetro 'ids' no contiene IDs válidos." });
      }

      const idSucursalNum =
        id_sucursal != null && id_sucursal !== "" ? Number(id_sucursal) : null;

      if (id_sucursal != null && !Number.isFinite(idSucursalNum)) {
        return res
          .status(400)
          .json({ error: "El parámetro 'id_sucursal' debe ser numérico." });
      }

      const rows = await InsumoService.getStocksForInsumos({
        ids: idList,
        idSucursal: idSucursalNum,
      });

      const map = new Map(
        rows.map((r) => [Number(r.id_insumo), Number(r.cantidad) || 0])
      );
      const data = idList.map((id) => ({
        id_insumo: id,
        cantidad: map.get(id) ?? 0,
        ...(idSucursalNum != null ? { id_sucursal: idSucursalNum } : {}),
      }));

      return res.status(200).json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async getStocksByFormula(req, res) {
    try {
      const { id_formula, id_sucursal, multiplicador } = req.query;

      const idFormulaNum = Number(id_formula);
      if (!Number.isFinite(idFormulaNum)) {
        return res
          .status(400)
          .json({
            error:
              "El parámetro 'id_formula' es requerido y debe ser numérico.",
          });
      }

      const idSucursalNum =
        id_sucursal != null && id_sucursal !== "" ? Number(id_sucursal) : null;
      if (id_sucursal != null && !Number.isFinite(idSucursalNum)) {
        return res
          .status(400)
          .json({ error: "El parámetro 'id_sucursal' debe ser numérico." });
      }

      const mult =
        multiplicador != null && multiplicador !== ""
          ? Number(multiplicador)
          : 1;
      if (!Number.isFinite(mult) || mult <= 0) {
        return res
          .status(400)
          .json({
            error: "El parámetro 'multiplicador' debe ser numérico positivo.",
          });
      }

      const result = await InsumoService.getStocksByFormula({
        idFormula: idFormulaNum,
        idSucursal: idSucursalNum,
        multiplicador: mult,
      });

      return res.status(200).json({ data: result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async getAllInsumos(req, res) {
    try {
      const filters = req.query;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
        search: req.query.search,
        tipo: req.query.tipo,
        id_sucursal: req.query.id_sucursal
          ? Number(req.query.id_sucursal)
          : undefined,
        includeInventario: req.query.includeInventario !== "false",
        userRol: req.user?.rol,
        userSucursalId: req.user?.id_sucursal,
      };
      delete filters.limit;
      delete filters.offset;

      const insumos = await InsumoService.getAllInsumos(filters, options);
      res.status(200).json({ data: insumos });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllInsumosAll(req, res) {
    try {
      console.log("Entrando");

      const filters = req.query;
      const options = {
        search: req.query.search,
        tipo: req.query.tipo,
        includeInventario: req.query.includeInventario !== "false",
        id_sucursal: req.query.id_sucursal
          ? Number(req.query.id_sucursal)
          : undefined,
        limit: Math.min(parseInt(req.query.limit, 10) || 2000, 10000),
        userRol: req.user?.rol,
        userSucursalId: req.user?.id_sucursal,
      };

      const items = await InsumoService.getAllInsumosAll(filters, options);
      res.status(200).json({ items });
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

      const insumos = await InsumoService.getAllInsumosVendibles(
        filters,
        options
      );
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
      const updated = await InsumoService.updateInsumo(
        req.params.id,
        req.body,
        req.file
      );

      res.status(200).json(updated);
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

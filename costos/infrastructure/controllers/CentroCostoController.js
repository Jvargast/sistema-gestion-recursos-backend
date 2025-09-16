import CentroCostoService from "../../application/CentroCostoService.js";

export const crear = async (req, res) => {
  try {
    const svc = new CentroCostoService();
    const data = await svc.crear(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const listar = async (req, res) => {
  try {
    const svc = new CentroCostoService();
    const { page = 1, limit = 20, ...filtros } = req.query;
    const items = await svc.listar({ ...filtros, page, limit });
    res.json({ items, page: Number(page) || 1, limit: Number(limit) || 20 });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const obtener = async (req, res) => {
  try {
    const svc = new CentroCostoService();
    const data = await svc.obtener(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

export const actualizar = async (req, res) => {
  try {
    const svc = new CentroCostoService();
    const data = await svc.actualizar(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    const svc = new CentroCostoService();
    await svc.eliminar(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export default { crear, listar, obtener, actualizar, eliminar };

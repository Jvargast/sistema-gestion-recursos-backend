import CategoriaGastoService from "../../application/CategoriaGastoService.js";

const svc = new CategoriaGastoService();

export async function crear(req, res) {
  try {
    const out = await svc.crear(req.body || {});
    res.status(201).json(out);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listar(req, res) {
  try {
    const { search, activo, page, limit, order, deducible } = req.query || {};
    const out = await svc.listar({ search, activo, page, limit, order, deducible });
    res.json(out);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function obtener(req, res) {
  try {
    const { id } = req.params;
    const out = await svc.obtener(id);
    res.json(out);
  } catch (err) {
    const code = /no encontrada/i.test(err.message) ? 404 : 400;
    res.status(code).json({ error: err.message });
  }
}

export async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const out = await svc.actualizar(id, req.body || {});
    res.json(out);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function eliminar(req, res) {
  try {
    const { id } = req.params;
    await svc.eliminar(id);
    res.status(204).end();
  } catch (err) {
    const code = /asociad/i.test(err.message) ? 409 : 400;
    res.status(code).json({ error: err.message });
  }
}

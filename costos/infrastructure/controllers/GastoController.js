import GastoService from "../../application/GastoService.js";

const toBool = (v) => {
  if (v === true || v === false) return v;
  if (v == null) return undefined;
  const s = String(v).toLowerCase();
  if (["1", "true", "si", "sí", "yes"].includes(s)) return true;
  if (["0", "false", "no"].includes(s)) return false;
  return undefined;
};

export const crear = async (req, res) => {
  try {
    const svc = new GastoService();
    const ctx = {
      usuarioId: req.user?.id_usuario ?? req.user?.id ?? null,
    };
    const gasto = await svc.crear(req.body, ctx);
    res.status(201).json(gasto);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const listar = async (req, res) => {
  try {
    const svc = new GastoService();
    const {
      search,
      fecha_desde,
      fecha_hasta,
      id_sucursal,
      id_categoria_gasto,
      id_proveedor,
      id_centro_costo,
      metodo_pago,
      deducible,
      activo,
      page = 1,
      limit = 20,
      order = "DESC",
    } = req.query;

    const filtros = {
      search,
      fecha_desde,
      fecha_hasta,
      id_sucursal: (id_sucursal ?? "") !== "" ? Number(id_sucursal) : undefined,
      id_categoria_gasto: id_categoria_gasto
        ? Number(id_categoria_gasto)
        : undefined,
      id_proveedor: id_proveedor ? Number(id_proveedor) : undefined,
      id_centro_costo: id_centro_costo ? Number(id_centro_costo) : undefined,
      metodo_pago,
      deducible: toBool(deducible),
      activo: toBool(activo),
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      order,
    };

    const data = await svc.listar(filtros);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const obtener = async (req, res) => {
  try {
    const svc = new GastoService();
    const gasto = await svc.obtener(Number(req.params.id));
    res.json(gasto);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

export const actualizar = async (req, res) => {
  try {
    const svc = new GastoService();
    const updated = await svc.actualizar(Number(req.params.id), req.body);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    const svc = new GastoService();
    await svc.eliminar(Number(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const listarAdjuntos = async (req, res) => {
  try {
    const svc = new GastoService();
    const items = await svc.listarAdjuntos(Number(req.params.id));
    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const eliminarAdjunto = async (req, res) => {
  try {
    const svc = new GastoService();
    await svc.eliminarAdjunto(
      Number(req.params.id),
      Number(req.params.adjuntoId)
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

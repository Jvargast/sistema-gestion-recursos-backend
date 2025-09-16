import OrdenPagoService from "../../application/OrdenPagoService.js";

const service = new OrdenPagoService();

export const crear = async (req, res) => {
  try {
    const data = await service.crear(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { id_proveedor, estado, from, to, page = 1, limit = 20 } = req.query;

    const data = await service.listar({
      id_proveedor: id_proveedor ? Number(id_proveedor) : undefined,
      estado,
      from,
      to,
      page: Number(page),
      limit: Number(limit),
    });

    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const obtener = async (req, res) => {
  try {
    const data = await service.obtener(Number(req.params.id));
    res.json(data);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

export const actualizar = async (req, res) => {
  try {
    const data = await service.actualizar(Number(req.params.id), req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const actualizarItems = async (req, res) => {
  try {
    const data = await service.actualizarItems(
      Number(req.params.id),
      req.body.items 
    );
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const confirmar = async (req, res) => {
  try {
    const data = await service.confirmarPago(Number(req.params.id), req.body); 
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    const n = await service.eliminar(Number(req.params.id));
    res.json({ deleted: n > 0 });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

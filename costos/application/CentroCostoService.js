import Repos from "../infrastructure/repositories/index.js";

export default class CentroCostoService {
  async crear(payload) {
    if (!payload?.nombre) throw new Error("nombre es requerido");
    if (!payload?.tipo) throw new Error("tipo es requerido"); 
    const centro = await Repos.centroCosto.create(payload);
    return Repos.centroCosto.findById(centro.id_centro_costo);
  }

  async listar({ id_sucursal, tipo, activo, search, page = 1, limit = 20 }) {
    const where = {};
    if (id_sucursal) where.id_sucursal = id_sucursal;
    if (tipo) where.tipo = tipo;
    if (typeof activo !== "undefined") where.activo = activo;

    if (search) {
      const { Op } = await import("sequelize");
      where.nombre = { [Op.like]: `%${search}%` };
    }

    return Repos.centroCosto.findAll({
      where,
      order: [["id_centro_costo", "DESC"]],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    });
  }

  async obtener(id_centro_costo) {
    const data = await Repos.centroCosto.findById(id_centro_costo);
    if (!data) throw new Error("Centro de costo no encontrado");
    return data;
  }

  async actualizar(id_centro_costo, patch) {
    await Repos.centroCosto.update(id_centro_costo, patch);
    return Repos.centroCosto.findById(id_centro_costo);
  }

  async eliminar(id_centro_costo) {
    return Repos.centroCosto.destroy(id_centro_costo);
  }
}

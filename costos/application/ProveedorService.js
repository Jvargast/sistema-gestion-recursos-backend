import Repos from "../infrastructure/repositories/index.js";

export default class ProveedorService {
  async crear(payload) {
    if (!payload?.razon_social) throw new Error("razon_social es requerido");

    if (payload?.rut) {
      const existente = await Repos.proveedor.findOne({
        where: { rut: payload.rut },
      });
      if (existente)
        throw new Error("El RUT ya está registrado para otro proveedor");
    }

    const prov = await Repos.proveedor.create(payload);
    return Repos.proveedor.findById(prov.id_proveedor);
  }

  async listar({ activo, search, page = 1, limit = 20 }) {
    const where = {};
    if (typeof activo !== "undefined") where.activo = activo;

    if (search) {
      const { Op } = await import("sequelize");
      where[Op.or] = [
        { razon_social: { [Op.like]: `%${search}%` } },
        { rut: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { telefono: { [Op.like]: `%${search}%` } },
      ];
    }

    return Repos.proveedor.findAll({
      where,
      order: [["razon_social", "ASC"]],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    });
  }

  async obtener(id_proveedor) {
    const data = await Repos.proveedor.findById(id_proveedor);
    if (!data) throw new Error("Proveedor no encontrado");
    return data;
  }

  async actualizar(id_proveedor, patch) {
    if (patch?.rut) {
      const { Op } = await import("sequelize");
      const dup = await Repos.proveedor.findOne({
        where: { rut: patch.rut, id_proveedor: { [Op.ne]: id_proveedor } },
      });
      if (dup) throw new Error("El RUT ya está registrado para otro proveedor");
    }

    await Repos.proveedor.update(id_proveedor, patch);
    return Repos.proveedor.findById(id_proveedor);
  }

  async eliminar(id_proveedor) {
    return Repos.proveedor.destroy(id_proveedor);
  }
}

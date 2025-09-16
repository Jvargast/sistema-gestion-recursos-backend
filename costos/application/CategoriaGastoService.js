import Repos from "../infrastructure/repositories/index.js";

const sanitizeNombre = (v = "") => String(v || "").trim();

export default class CategoriaGastoService {
  async crear({
    nombre_categoria,
    tipo_categoria,
    descripcion = "",
    activo = true,
    deducible,
  }) {
    const nom = sanitizeNombre(nombre_categoria);
    if (!nom || nom.length < 2) {
      throw new Error(
        "El nombre_categoria es obligatorio (mínimo 2 caracteres)."
      );
    }

    const { Op } = await import("sequelize");
    const dup = await Repos.categoria.findAll({
      where: {
        nombre_categoria: {
          [Op.iLike ?? Op.like]: Op.iLike ? nom : `%${nom}%`,
        },
      },
      limit: 1,
    });
    if (
      dup?.length &&
      dup[0]?.nombre_categoria?.toLowerCase() === nom.toLowerCase()
    ) {
      throw new Error(
        "Ya existe una categoría de gasto con ese nombre_categoria."
      );
    }

    const cat = await Repos.categoria.create({
      nombre_categoria: nom,
      tipo_categoria,
      descripcion: String(descripcion || "").trim(),
      activo: !!activo,
      deducible,
    });

    return Repos.categoria.findById(cat.id_categoria_gasto);
  }

  async listar({
    search,
    activo,
    page = 1,
    limit = 20,
    order = "ASC",
    deducible,
  } = {}) {
    const where = {};
    if (typeof activo !== "undefined" && activo !== null) {
      where.activo = Boolean(
        String(activo) === "true" || String(activo) === "1" || activo === true
      );
    }
    if (typeof deducible === "boolean") where.deducible = deducible;
    if (search) {
      const { Op } = await import("sequelize");
      where.nombre_categoria = {
        [Op.iLike ?? Op.like]: Op.iLike ? `%${search}%` : `%${search}%`,
      };
    }

    return Repos.categoria.findAll({
      where,
      order: [
        [
          "nombre_categoria",
          String(order).toUpperCase() === "DESC" ? "DESC" : "ASC",
        ],
      ],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    });
  }

  async obtener(id) {
    const cat = await Repos.categoria.findById(id);
    if (!cat) throw new Error("Categoría de gasto no encontrada");
    return cat;
  }

  async actualizar(id, patch = {}) {
    const current = await Repos.categoria.findById(id);
    if (!current) throw new Error("Categoría de gasto no encontrada");

    const next = { ...patch };

    if (typeof next.nombre_categoria !== "undefined") {
      const nom = sanitizeNombre(next.nombre_categoria);
      if (!nom || nom.length < 2) {
        throw new Error(
          "El nombre_categoria es obligatorio (mínimo 2 caracteres)."
        );
      }
      if (
        nom.toLowerCase() !== String(current.nombre_categoria).toLowerCase()
      ) {
        const { Op } = await import("sequelize");
        const dup = await Repos.categoria.findAll({
          where: {
            nombre_categoria: {
              [Op.iLike ?? Op.like]: Op.iLike ? nom : `%${nom}%`,
            },
          },
          limit: 1,
        });
        if (
          dup?.length &&
          dup[0]?.id_categoria_gasto !== Number(id) &&
          dup[0]?.nombre_categoria?.toLowerCase() === nom.toLowerCase()
        ) {
          throw new Error(
            "Ya existe una categoría de gasto con ese nombre_categoria."
          );
        }
      }
      next.nombre_categoria = nom;
    }

    if (typeof next.descripcion !== "undefined") {
      next.descripcion = String(next.descripcion || "").trim();
    }
    if (typeof next.activo !== "undefined") {
      next.activo = !!next.activo;
    }

    await Repos.categoria.update(id, next);
    return Repos.categoria.findById(id);
  }

  async eliminar(id) {
    try {
      const count = await Repos.gasto?.count?.({
        where: { id_categoria_gasto: id },
      });
      if (typeof count === "number" && count > 0) {
        throw new Error(
          "No se puede eliminar: la categoría tiene gastos asociados."
        );
      }
    } catch (_) {}

    return Repos.categoria.destroy(id);
  }
}

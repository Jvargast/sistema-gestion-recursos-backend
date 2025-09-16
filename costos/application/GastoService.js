import sequelize from "../../database/database.js";
import { obtenerFechaChile } from "../../shared/utils/fechaUtils.js";
import { saveAdjuntosB64 } from "../../shared/utils/saveAdjuntosB64.js";
import Repos from "../infrastructure/repositories/index.js";
import path from "node:path";
import fs from "node:fs/promises";

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");

const fecha_db =
  typeof fecha === "string" && fecha.trim()
    ? fecha.trim().slice(0, 10)
    : obtenerFechaChile("YYYY-MM-DD");

const int = (v) => Number.parseInt(v ?? 0, 10) || 0;

const has = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

export default class GastoService {
  async crear(payload, ctx = {}) {
    const {
      adjuntos = [],
      documento,
      fecha,
      id_categoria_gasto,
      id_proveedor = null,
      id_sucursal: id_sucursal_in = null,
      id_centro_costo = null,
      metodo_pago = null,
      monto_neto,
      iva = 0,
      total,
      moneda = "CLP",
      descripcion = "",
      usuario_id: usuario_in = null,
    } = payload || {};

    const usuario_id = ctx.usuarioId ?? usuario_in ?? null;
    const id_sucursal = id_sucursal_in ?? null;
    if (!id_sucursal) {
      throw new Error(
        "Debes indicar una sucursal (id_sucursal) para el gasto."
      );
    }

    if (!id_categoria_gasto) {
      throw new Error("La categoría de gasto es obligatoria.");
    }

    const montoN = int(monto_neto);
    const ivaN = int(iva);
    const totalN = int(total);

    if (montoN <= 0) throw new Error("El monto neto debe ser mayor a 0.");
    if (totalN <= 0) throw new Error("El total debe ser mayor a 0.");
    if (montoN + ivaN !== totalN) {
      throw new Error("La suma de monto neto e IVA debe ser igual al total.");
    }

    const tipo_documento = documento?.tipo || null;
    const nro_documento = documento?.folio || null;

    const toCreate = {
      fecha: fecha_db,
      id_categoria_gasto,
      id_proveedor,
      id_sucursal,
      id_centro_costo,
      metodo_pago,
      monto_neto: montoN,
      iva: ivaN,
      total: totalN,
      moneda,
      descripcion: String(descripcion || "").trim(),
      tipo_documento,
      nro_documento,
      usuario_id,
    };

    const t = await sequelize.transaction();
    try {
      const gasto = await Repos.gasto.create(toCreate, { transaction: t });

      if (Array.isArray(adjuntos) && adjuntos.length) {
        const saved = await saveAdjuntosB64(gasto.id_gasto, adjuntos);
        if (saved.length) {
          await Repos.gastoAdjunto.bulkCreate(saved, { transaction: t });
        }
      }

      await t.commit();
      return Repos.gasto.findById(gasto.id_gasto);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  async listar({
    page = 1,
    limit = 20,
    search,
    id_sucursal,
    fecha_desde,
    fecha_hasta,
    order = "DESC",
  } = {}) {
    const { Op } = await import("sequelize");
    const where = {};
    if (id_sucursal != null && String(id_sucursal) !== "") {
      where.id_sucursal = Number(id_sucursal);
    }
    if (fecha_desde || fecha_hasta) {
      where.fecha = {};
      if (fecha_desde) where.fecha[Op.gte] = fecha_desde; // "YYYY-MM-DD"
      if (fecha_hasta) where.fecha[Op.lte] = fecha_hasta; // "YYYY-MM-DD"
    }
    const Proveedor = (await import("../domain/models/Proveedor.js")).default;
    const CategoriaGasto = (await import("../domain/models/CategoriaGasto.js"))
      .default;
    const Sucursal = (await import("../../auth/domain/models/Sucursal.js"))
      .default;

    const include = [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["id_proveedor", "razon_social", "rut"],
      },
      {
        model: CategoriaGasto,
        as: "categoria",
        attributes: [
          "id_categoria_gasto",
          "nombre_categoria",
          "tipo_categoria",
        ],
      },
      {
        model: Sucursal,
        as: "sucursal",
        attributes: ["id_sucursal", "nombre"],
      },
    ];

    const like = (v) =>
      Op.iLike ? { [Op.iLike]: `%${v}%` } : { [Op.like]: `%${v}%` };
    const searchWhere = search?.trim()
      ? {
          [Op.or]: [
            { "$proveedor.razon_social$": like(search) },
            { "$categoria.nombre_categoria$": like(search) },
            { "$categoria.tipo_categoria$": like(search) },
            { nro_documento: like(search) },
            { descripcion: like(search) },
          ],
        }
      : null;

    const finalWhere = searchWhere ? { [Op.and]: [where, searchWhere] } : where;

    const [items, total] = await Promise.all([
      Repos.gasto.findAll({
        where: finalWhere,
        include,
        order: [
          ["fecha", String(order).toUpperCase() === "ASC" ? "ASC" : "DESC"],
          ["id_gasto", "DESC"],
        ],
        offset: (Number(page) - 1) * Number(limit),
        limit: Number(limit),
      }),
      Repos.gasto.count({
        where: finalWhere,
        include,
        distinct: true,
        col: "id_gasto",
        subQuery: false,
      }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit) };
  }

  async obtener(id) {
    const gasto = await Repos.gasto.findById(id);
    if (!gasto) throw new Error("Gasto no encontrado");
    return gasto;
  }

  async actualizar(id, patch = {}) {
    const current = await Repos.gasto.findById(id);
    if (!current) throw new Error("Gasto no encontrado");

    const next = {};

    if (typeof patch.id_categoria_gasto !== "undefined")
      next.id_categoria_gasto = patch.id_categoria_gasto ?? null;
    if (typeof patch.id_proveedor !== "undefined")
      next.id_proveedor = patch.id_proveedor ?? null;
    if (typeof patch.id_centro_costo !== "undefined")
      next.id_centro_costo = patch.id_centro_costo ?? null;
    if (typeof patch.id_sucursal !== "undefined")
      next.id_sucursal = patch.id_sucursal ?? null;
    if (typeof patch.metodo_pago !== "undefined")
      next.metodo_pago = patch.metodo_pago ?? null;
    if (typeof patch.moneda !== "undefined")
      next.moneda = patch.moneda ?? "CLP";
    if (typeof patch.descripcion !== "undefined")
      next.descripcion = String(patch.descripcion || "").trim();

    if (typeof patch.fecha !== "undefined") {
      if (!patch.fecha) {
        next.fecha = null;
      } else if (typeof patch.fecha === "string") {
        next.fecha = patch.fecha.slice(0, 10);
      } else {
        next.fecha = patch.fecha;
      }
    }

    if (patch.documento) {
      if (Object.prototype.hasOwnProperty.call(patch.documento, "tipo"))
        next.tipo_documento = patch.documento.tipo || null;
      if (Object.prototype.hasOwnProperty.call(patch.documento, "folio"))
        next.nro_documento = patch.documento.folio || null;
    }
    const montoN = has(patch, "monto_neto")
      ? toIntOrNull(patch.monto_neto)
      : null;
    const ivaN = has(patch, "iva") ? toIntOrNull(patch.iva) : null;
    const totalN = has(patch, "total") ? toIntOrNull(patch.total) : null;
    const tocaMontos = montoN !== null || ivaN !== null || totalN !== null;

    if (tocaMontos) {
      const n = montoN !== null ? montoN : current.monto_neto;
      const i = ivaN !== null ? ivaN : current.iva;
      const t = totalN !== null ? totalN : current.total;

      if (n <= 0) throw new Error("El monto neto debe ser mayor a 0.");
      if (t <= 0) throw new Error("El total debe ser mayor a 0.");
      if (n + i !== t)
        throw new Error("La suma de monto neto e IVA debe ser igual al total.");

      if (montoN !== null) next.monto_neto = n;
      if (ivaN !== null) next.iva = i;
      if (totalN !== null) next.total = t;
    }

    if (patch.documento) {
      if (has(patch.documento, "tipo"))
        next.tipo_documento = patch.documento.tipo || null;
      if (has(patch.documento, "folio"))
        next.nro_documento = patch.documento.folio || null;
    } else {
      if (has(patch, "tipo_documento"))
        next.tipo_documento = patch.tipo_documento || null;
      if (has(patch, "nro_documento"))
        next.nro_documento = patch.nro_documento || null;
    }

    await Repos.gasto.update(id, next);
    return Repos.gasto.findById(id);
  }

  async eliminar(id) {
    const t = await sequelize.transaction();
    try {
      const gasto = await Repos.gasto.findById(id, { transaction: t });
      if (!gasto) throw new Error("Gasto no encontrado");

      const adjuntos = await Repos.gastoAdjunto.findAll({
        where: { id_gasto: id },
        transaction: t,
      });
      for (const a of adjuntos) {
        if (!a?.path_rel) continue;
        const safeRel = String(a.path_rel).replace(/^[/\\]+/, "");
        const abs = path.resolve(UPLOAD_DIR, safeRel);
        if (!abs.startsWith(UPLOAD_DIR + path.sep)) {
          console.warn("Ruta sospechosa, se omite:", abs);
          continue;
        }
        try {
          await fs.unlink(abs);
        } catch (e) {
          if (e.code !== "ENOENT") {
            console.warn("No se pudo eliminar archivo:", abs, e);
          }
        }
      }
      await Repos.gastoAdjunto.destroyWhere(
        { id_gasto: id },
        { transaction: t }
      );
      await Repos.gasto.destroy(id, { transaction: t });

      await t.commit();
      return { ok: true };
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  async listarAdjuntos(id_gasto) {
    return Repos.gastoAdjunto.findAll({
      where: { id_gasto },
      order: [
        ["fecha_subida", "DESC"],
        ["id_adjunto", "DESC"],
      ],
    });
  }

  async eliminarAdjunto(id_gasto, adjuntoId) {
    const gid = Number(id_gasto);
    const aid = Number(adjuntoId);
    if (!Number.isInteger(gid) || !Number.isInteger(aid)) {
      throw new Error("IDs inválidos");
    }

    const adj = await Repos.gastoAdjunto.findOne({
      where: { id_adjunto: aid, id_gasto: gid },
      raw: true,
    });
    if (!adj) throw new Error("Adjunto no encontrado para este gasto.");

    if (adj.path_rel) {
      const safeRel = String(adj.path_rel).replace(/^[/\\]+/, "");
      const abs = path.resolve(UPLOAD_DIR, safeRel);

      const normUpload = path.normalize(UPLOAD_DIR + path.sep);
      const normAbs = path.normalize(abs);
      if (!normAbs.startsWith(normUpload)) {
        throw new Error("Ruta de adjunto inválida.");
      }

      try {
        await fs.unlink(abs);
      } catch (e) {
        if (e.code !== "ENOENT") {
          console.warn("No se pudo eliminar archivo:", abs, e);
        }
      }
    }

    await Repos.gastoAdjunto.destroyWhere({ id_adjunto: aid, id_gasto: gid });

    return { ok: true };
  }
}

import sequelize from "../../database/database.js";
import Repos from "../infrastructure/repositories/index.js";

export default class ComprasService {
  constructor({ eventBus } = {}) {
    this.eventBus = eventBus;
  }

  async crear({ header, items }) {
    if (!header?.id_proveedor) throw new Error("id_proveedor es requerido");
    if (!Array.isArray(items) || !items.length)
      throw new Error("items es requerido");

    return sequelize.transaction(async (tx) => {
      const compra = await Repos.compra.create(
        { ...header, estado: header?.estado ?? "borrador" },
        { transaction: tx }
      );

      const IVA_DEC = Number.isFinite(header?.iva_porcentaje)
        ? Number(header.iva_porcentaje)
        : 0.19;
      const IVA_PCT = Math.round(IVA_DEC * 100);

      const rows = items.map((i) => {
        if (!i?.id_insumo && !String(i?.descripcion || "").trim()) {
          throw new Error("Cada ítem debe tener id_insumo o descripción.");
        }

        const cantidad = Math.max(0, Number(i.cantidad || 0));
        const precio = Math.max(0, Number(i.precio_unitario || 0));
        const neto = cantidad * precio;
        const descuento = Math.max(0, Number(i.descuento || 0));
        const afectaIva = i.afecta_iva === true;
        const iva_monto = afectaIva
          ? Math.round((neto - descuento) * IVA_DEC)
          : 0;
        const total = neto - descuento + iva_monto;

        return {
          id_compra: compra.id_compra,
          id_insumo: i.id_insumo ?? null,
          descripcion: i.descripcion ?? null,
          cantidad,
          precio_unitario: precio,
          descuento,
          iva_monto,
          total,
          afecta_iva: afectaIva,
          subtotal: neto,
        };
      });

      const rowsInsert = rows.map((r) => ({
        id_compra: r.id_compra,
        id_insumo: r.id_insumo,
        descripcion: r.descripcion,
        cantidad: r.cantidad,
        precio_unitario: r.precio_unitario,
        descuento: r.descuento,
        iva_monto: r.iva_monto,
        total: r.total,
      }));
      await Repos.compraItem.bulkCreate(rowsInsert, { transaction: tx });

      const calcTotales = (items) => {
        const lineaNeta = (it) =>
          Math.max(
            0,
            Math.round(Number(it.cantidad) * Number(it.precio_unitario)) -
              (Number(it.descuento) || 0)
          );
        const subtotal = items.reduce((acc, it) => acc + lineaNeta(it), 0);
        const baseIva = items.reduce(
          (acc, it) => acc + (it.afecta_iva ? lineaNeta(it) : 0),
          0
        );
        const iva = Math.round((baseIva * IVA_PCT) / 100);
        return { subtotal, iva, total: subtotal + iva };
      };

      const { subtotal, iva, total } = calcTotales(rows);
      await Repos.compra.update(
        compra.id_compra,
        { subtotal, iva, total },
        { transaction: tx }
      );

      return Repos.compra.findById(compra.id_compra, { transaction: tx });
    });
  }

  async listar({
    estado,
    id_sucursal,
    id_proveedor,
    from,
    to,
    page = 1,
    limit = 20,
  }) {
    const where = {};
    if (estado) where.estado = estado;
    if (id_sucursal) where.id_sucursal = id_sucursal;
    if (id_proveedor) where.id_proveedor = id_proveedor;
    if (from || to) {
      const { Op } = await import("sequelize");
      if (from && to) where.fecha = { [Op.between]: [from, to] };
      else if (from) where.fecha = { [Op.gte]: from };
      else if (to) where.fecha = { [Op.lte]: to };
    }

    return Repos.compra.findAll({
      where,
      include: [{ association: "proveedor" }],
      order: [
        ["fecha", "DESC"],
        ["id_compra", "DESC"],
      ],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    });
  }

  async obtener(id_compra) {
    const compra = await Repos.compra.findById(id_compra);
    if (!compra) throw new Error("Compra no encontrada");
    return compra;
  }

  async recibirParcialOTotal({ id_compra, itemsRecibidos }) {
    if (!id_compra) throw new Error("id_compra requerido");
    if (!Array.isArray(itemsRecibidos) || !itemsRecibidos.length)
      throw new Error("itemsRecibidos requerido");

    return sequelize.transaction(async (tx) => {
      const compra = await Repos.compra.findById(id_compra, {
        transaction: tx,
      });
      if (!compra) throw new Error("Compra no encontrada");

      const idsValidos = new Set(compra.items.map((i) => i.id_compra_item));

      for (const r of itemsRecibidos) {
        if (!idsValidos.has(Number(r.id_compra_item))) continue;

        const item = await Repos.compraItem.findByPk(r.id_compra_item, {
          transaction: tx,
        });
        if (!item) continue;

        const nuevo = Math.min(
          Number(item.cantidad),
          Number(item.cantidad_recibida) + Number(r.cantidad)
        );

        await Repos.compraItem.update(
          item.id_compra_item,
          { cantidad_recibida: nuevo },
          { transaction: tx }
        );
      }

      const c = await Repos.compra.findById(id_compra, { transaction: tx });
      const completa = c.items.every(
        (i) => Number(i.cantidad_recibida) >= Number(i.cantidad)
      );

      await Repos.compra.update(
        id_compra,
        { estado: completa ? "recibida" : "aprobada" },
        { transaction: tx }
      );

      if (this.eventBus) {
        await this.eventBus.publish?.("CompraRecibida", {
          compraId: id_compra,
          sucursalId: c.id_sucursal,
          items: c.items.map((i) => ({
            id_insumo: i.id_insumo,
            cantidad: Number(i.cantidad_recibida),
            costo_unitario: Number(i.precio_unitario),
          })),
        });
      }

      return Repos.compra.findById(id_compra, { transaction: tx });
    });
  }

  async actualizar(id_compra, patch = {}) {
    const { items: itemsDiff, iva_porcentaje, ...headerPatch } = patch || {};

    const IVA_DEC = Number.isFinite(iva_porcentaje)
      ? Number(iva_porcentaje)
      : 0.19;
    const IVA_PCT = Math.round(IVA_DEC * 100);

    return sequelize.transaction(async (tx) => {
      if (Object.keys(headerPatch).length) {
        await Repos.compra.update(id_compra, headerPatch, { transaction: tx });
      }

      if (itemsDiff && typeof itemsDiff === "object") {
        const { add = [], update = [], remove = [] } = itemsDiff;

        if (Array.isArray(remove) && remove.length) {
          await Repos.compraItem.destroy(
            { where: { id_compra_item: remove, id_compra } },
            { transaction: tx }
          );
        }

        if (Array.isArray(update) && update.length) {
          for (const u of update) {
            const cantidad = Math.max(0, Number(u.cantidad || 0));
            const precio = Math.max(0, Number(u.precio_unitario || 0));
            const descuento = Math.max(0, Number(u.descuento || 0));
            const neto = Math.max(0, Math.round(cantidad * precio) - descuento);
            const iva_monto =
              u.afecta_iva === true ? Math.round((neto * IVA_PCT) / 100) : 0;
            const total = neto + iva_monto;

            await Repos.compraItem.update(
              u.id_compra_item,
              {
                id_insumo: u.id_insumo ?? null,
                descripcion: u.descripcion ?? null,
                cantidad,
                precio_unitario: precio,
                descuento,
                iva_monto,
                total,
              },
              { transaction: tx }
            );
          }
        }

        if (Array.isArray(add) && add.length) {
          const rowsAdd = add.map((a) => {
            const cantidad = Math.max(0, Number(a.cantidad || 0));
            const precio = Math.max(0, Number(a.precio_unitario || 0));
            const descuento = Math.max(0, Number(a.descuento || 0));
            const neto = Math.max(0, Math.round(cantidad * precio) - descuento);
            const iva_monto =
              a.afecta_iva === true ? Math.round((neto * IVA_PCT) / 100) : 0;
            const total = neto + iva_monto;

            return {
              id_compra,
              id_insumo: a.id_insumo ?? null,
              descripcion: a.descripcion ?? null,
              cantidad,
              precio_unitario: precio,
              descuento,
              iva_monto,
              total,
            };
          });

          await Repos.compraItem.bulkCreate(rowsAdd, { transaction: tx });
        }
      }

      const itemsDb = await Repos.compraItem.findAll(
        { where: { id_compra } },
        { transaction: tx }
      );

      const lineaNeta = (it) =>
        Math.max(
          0,
          Math.round(Number(it.cantidad) * Number(it.precio_unitario)) -
            (Number(it.descuento) || 0)
        );

      const subtotal = itemsDb.reduce((acc, it) => acc + lineaNeta(it), 0);
      const baseIva = itemsDb.reduce(
        (acc, it) => acc + (Number(it.iva_monto || 0) > 0 ? lineaNeta(it) : 0),
        0
      );
      const iva = Math.round((baseIva * IVA_PCT) / 100);
      const total = subtotal + iva;

      await Repos.compra.update(
        id_compra,
        { subtotal, iva, total },
        { transaction: tx }
      );

      return Repos.compra.findById(id_compra, { transaction: tx });
    });
  }

  async eliminar(id_compra) {
    return Repos.compra.destroy(id_compra);
  }
}

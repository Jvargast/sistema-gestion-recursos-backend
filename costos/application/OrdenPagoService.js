import sequelize from "../../database/database.js";
import Repos from "../infrastructure/repositories/index.js";

const TIPO_DOC = {
  COMPRA: "compra",
  GASTO: "gasto",
};

const normalizeTipo = (t = "") => String(t).toLowerCase();

async function getSaldoDocumento({ tipo, id, tx }) {
  if (normalizeTipo(tipo) === TIPO_DOC.COMPRA) {
    const c = await Repos.compra.findById(id, { transaction: tx });
    if (!c) throw new Error(`Compra ${id} no encontrada`);
    const total = Number(c.total || 0);
    const pagadoActual = Number(c.total_pagado || c.pagado || 0);
    return {
      doc: c,
      total,
      pagadoActual,
      saldo: Math.max(0, total - pagadoActual),
    };
  }

  if (normalizeTipo(tipo) === TIPO_DOC.GASTO) {
    const g = await Repos.gasto.findById(id, { transaction: tx });
    if (!g) throw new Error(`Gasto ${id} no encontrado`);
    const total = Number(g.monto || g.total || 0);
    const pagadoActual = Number(g.pagado || g.total_pagado || 0);
    return {
      doc: g,
      total,
      pagadoActual,
      saldo: Math.max(0, total - pagadoActual),
    };
  }

  throw new Error(`Tipo de documento inválido: ${tipo}`);
}

export default class OrdenPagoService {
  constructor({ eventBus } = {}) {
    this.eventBus = eventBus;
  }

  async crear({ header, items }) {
    if (!header?.id_proveedor) throw new Error("id_proveedor es requerido");
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("items es requerido");
    }

    return sequelize.transaction(async (tx) => {
      const lineas = [];
      let totalOrden = 0;

      for (const it of items) {
        const tipo = normalizeTipo(it.tipo);
        const idRef = Number(it.id_referencia || it.id_documento || it.id);
        const montoReq = Number(it.monto || 0);

        if (!idRef || montoReq <= 0) {
          throw new Error("Cada item requiere id_referencia y monto > 0");
        }

        const { doc, saldo } = await getSaldoDocumento({ tipo, id: idRef, tx });

        if (
          tipo === TIPO_DOC.COMPRA &&
          Number(doc.id_proveedor) !== Number(header.id_proveedor)
        ) {
          throw new Error(
            `La compra ${idRef} no pertenece al proveedor de la OP`
          );
        }
        if (
          tipo === TIPO_DOC.GASTO &&
          doc.id_proveedor &&
          Number(doc.id_proveedor) !== Number(header.id_proveedor)
        ) {
          throw new Error(
            `El gasto ${idRef} no pertenece al proveedor de la OP`
          );
        }

        const monto = Math.min(montoReq, saldo);
        if (monto <= 0) continue;

        totalOrden += monto;
        lineas.push({
          id_referencia: idRef,
          tipo,
          monto,
          saldo_antes: saldo,
        });
      }

      if (lineas.length === 0)
        throw new Error("No hay líneas válidas para pagar");

      const op = await Repos.ordenPago.create(
        {
          ...header,
          estado: header?.estado ?? "borrador",
          fecha: header?.fecha ?? new Date(),
          total: totalOrden,
          total_pagado: 0,
          saldo: totalOrden,
        },
        { transaction: tx }
      );

      const rows = lineas.map((l) => ({
        ...l,
        id_orden_pago: op.id_orden_pago,
      }));
      await Repos.ordenPagoItem.bulkCreate(rows, { transaction: tx });

      return Repos.ordenPago.findById(op.id_orden_pago, {
        transaction: tx,
        include: [{ association: "proveedor" }, { association: "items" }],
      });
    });
  }

  async listar({ id_proveedor, estado, from, to, page = 1, limit = 20 } = {}) {
    const where = {};
    if (id_proveedor) where.id_proveedor = id_proveedor;
    if (estado) where.estado = estado;
    if (from || to) {
      const { Op } = await import("sequelize");
      if (from && to) where.fecha = { [Op.between]: [from, to] };
      else if (from) where.fecha = { [Op.gte]: from };
      else if (to) where.fecha = { [Op.lte]: to };
    }

    return Repos.ordenPago.findAll({
      where,
      include: [{ association: "proveedor" }],
      order: [
        ["fecha", "DESC"],
        ["id_orden_pago", "DESC"],
      ],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    });
  }

  async obtener(id) {
    const op = await Repos.ordenPago.findById(id, {
      include: [{ association: "proveedor" }, { association: "items" }],
    });
    if (!op) throw new Error("Orden de Pago no encontrada");
    return op;
  }

  async actualizarItems(id_orden_pago, items) {
    if (!Array.isArray(items) || !items.length) {
      throw new Error("items requerido");
    }

    return sequelize.transaction(async (tx) => {
      const op = await Repos.ordenPago.findById(id_orden_pago, {
        transaction: tx,
      });
      if (!op) throw new Error("OP no encontrada");
      if (op.estado !== "borrador")
        throw new Error("Solo se puede editar una OP en borrador");

      await Repos.ordenPagoItem.destroyByOrden(id_orden_pago, {
        transaction: tx,
      });

      const header = { id_proveedor: op.id_proveedor };
      const tmp = await this.crear({ header, items });

      return tmp;
    });
  }

  async confirmarPago(id_orden_pago, { metodo_pago, ref_pago, notas } = {}) {
    return sequelize.transaction(async (tx) => {
      const op = await Repos.ordenPago.findById(id_orden_pago, {
        transaction: tx,
        include: [{ association: "items" }],
      });
      if (!op) throw new Error("OP no encontrada");
      if (op.estado === "pagada") return op;
      if (!op.items?.length) throw new Error("OP sin ítems");

      let aplicado = 0;

      for (const it of op.items) {
        const { tipo, id_referencia, monto } = it;

        if (normalizeTipo(tipo) === TIPO_DOC.COMPRA) {
          const c = await Repos.compra.findById(id_referencia, {
            transaction: tx,
          });
          if (!c) throw new Error(`Compra ${id_referencia} no encontrada`);

          const nuevoPagado =
            Number(c.total_pagado || c.pagado || 0) + Number(monto);
          const saldoRest = Math.max(0, Number(c.total || 0) - nuevoPagado);

          await Repos.compra.update(
            c.id_compra,
            {
              total_pagado: nuevoPagado,
              estado: saldoRest <= 0 ? "pagada" : c.estado || "aprobada",
            },
            { transaction: tx }
          );
        } else if (normalizeTipo(tipo) === TIPO_DOC.GASTO) {
          const g = await Repos.gasto.findById(id_referencia, {
            transaction: tx,
          });
          if (!g) throw new Error(`Gasto ${id_referencia} no encontrado`);

          const nuevoPagado =
            Number(g.pagado || g.total_pagado || 0) + Number(monto);
          const base = Number(g.monto || g.total || 0);
          const saldoRest = Math.max(0, base - nuevoPagado);

          await Repos.gasto.update(
            g.id_gasto,
            {
              pagado: nuevoPagado,
              estado: saldoRest <= 0 ? "pagado" : g.estado || "aprobado",
            },
            { transaction: tx }
          );
        }
        aplicado += Number(monto);
      }

      await Repos.ordenPago.update(
        id_orden_pago,
        {
          estado: "pagada",
          total_pagado: aplicado,
          saldo: Math.max(0, Number(op.total || 0) - aplicado),
          metodo_pago: metodo_pago || null,
          ref_pago: ref_pago || null,
          notas: notas ?? op.notas,
          fecha_pago: new Date(),
        },
        { transaction: tx }
      );

      const updated = await Repos.ordenPago.findById(id_orden_pago, {
        transaction: tx,
        include: [{ association: "proveedor" }, { association: "items" }],
      });

      this.eventBus?.publish?.("OrdenPagoConfirmada", {
        id_orden_pago,
        proveedor: updated?.proveedor,
        total: updated?.total,
        aplicado,
      });

      return updated;
    });
  }

  async actualizar(id, patch) {
    await Repos.ordenPago.update(id, patch);
    return Repos.ordenPago.findById(id);
  }

  async eliminar(id) {
    const op = await Repos.ordenPago.findById(id);
    if (!op) return 0;
    if (op.estado !== "borrador")
      throw new Error("Solo se puede eliminar una OP en borrador");
    return Repos.ordenPago.destroy(id);
  }
}

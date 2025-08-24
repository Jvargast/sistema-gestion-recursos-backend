import { Op } from "sequelize";
import paginate from "../../shared/utils/pagination.js";
import SequelizeFormulaRepository from "../infrastructure/repositories/FormulaProductoRepository.js";
import SequelizeFormulaDetalleRepository from "../infrastructure/repositories/FormulaDetalleProductoRepository.js";
import InsumoRepository from "../infrastructure/repositories/InsumoRepository.js";
import ProductosRepository from "../infrastructure/repositories/ProductosRepository.js";
import sequelize from "../../database/database.js";

class FormulaProductoService {
  constructor() {
    this.formulaRepository = new SequelizeFormulaRepository();
    this.formulaDetalleRepository = new SequelizeFormulaDetalleRepository();
  }

  async getAllFormulas(options = {}, filters = {}) {
    const where = {};

    if (filters.nombre_formula) {
      where.nombre_formula = { [Op.iLike]: `%${filters.nombre_formula}%` };
    }
    if (filters.id_producto_final) {
      where.id_producto_final = filters.id_producto_final;
    }

    return await paginate(this.formulaRepository.getModel(), options, {
      where,
      include: [
        {
          model: ProductosRepository.getModel(),
          as: "Producto",
        },
        {
          model: this.formulaDetalleRepository.getModel(),
          as: "FormulaProductoDetalles",
          include: [
            {
              model: InsumoRepository.getModel(),
              as: "Insumo",
            },
          ],
        },
      ],
      order: [["id_formula", "DESC"]],
    });
  }

  async getFormulasByProductoId(idProducto) {
    return await this.formulaRepository.findByProductoId(idProducto);
  }

  async getFormulaById(idFormula, idSucursal) {
    return await this.formulaRepository.findById(idFormula, { idSucursal });
  }

  async createFormula(formulaData) {
    const {
      id_producto_final,
      cantidad_producto_final,
      nombre_formula,
      insumos,
    } = formulaData;

    if (
      !id_producto_final ||
      !cantidad_producto_final ||
      !nombre_formula ||
      !Array.isArray(insumos) ||
      insumos.length === 0
    ) {
      throw new Error("Datos incompletos para crear la fórmula");
    }

    const createdFormula = await this.formulaRepository.create({
      nombre_formula,
      id_producto_final,
      cantidad_requerida: cantidad_producto_final,
      activo: true,
    });

    const detallesToCreate = insumos.map((insumo) => {
      if (!insumo.id_insumo || !insumo.cantidad) {
        throw new Error(`Datos incompletos en uno de los insumos`);
      }

      return {
        id_formula: createdFormula.id_formula,
        id_insumo: insumo.id_insumo,
        cantidad_requerida: insumo.cantidad,
        unidad_de_medida: insumo.unidad_medida || null,
      };
    });

    const createdDetalles = await this.formulaDetalleRepository.bulkCreate(
      detallesToCreate
    );

    return {
      message: "Fórmula creada con éxito",
      formula: createdFormula,
      detalles: createdDetalles,
    };
  }

  async updateFormula(idFormula, data) {
    const t = await sequelize.transaction();
    try {
      /* ── 1.  Validaciones básicas ───────────────────────── */
      const {
        nombre_formula,
        id_producto_final,
        cantidad_producto_final,
        insumos = [],
      } = data;

      const header = await this.formulaRepository.findById(idFormula, {
        transaction: t,
      });
      if (!header) throw new Error("Fórmula no encontrada");

      await header.update(
        {
          nombre_formula,
          id_producto_final,
          cantidad_requerida: cantidad_producto_final,
        },
        { transaction: t }
      );

      const existentes = await this.formulaDetalleRepository.findByFormulaId(
        idFormula,
        { transaction: t }
      );

      const mapExist = new Map(existentes.map((d) => [d.id_insumo, d]));

      const idsEnPayload = new Set();

      for (const det of insumos) {
        const { id_insumo, cantidad, unidad_medida } = det;
        idsEnPayload.add(id_insumo);

        if (mapExist.has(id_insumo)) {
          await mapExist.get(id_insumo).update(
            {
              cantidad_requerida: cantidad,
              unidad_de_medida: unidad_medida,
            },
            { transaction: t }
          );
        } else {
          await this.formulaDetalleRepository.create(
            {
              id_formula: idFormula,
              id_insumo,
              cantidad_requerida: cantidad,
              unidad_de_medida: unidad_medida,
            },
            { transaction: t }
          );
        }
      }

      for (const det of existentes) {
        if (!idsEnPayload.has(det.id_insumo)) {
          await det.destroy({ transaction: t });
        }
      }

      await t.commit();
      return await this.formulaRepository.findById(idFormula);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async deleteFormula(idFormula) {
    const formulaExistente = await this.formulaRepository.findById(idFormula);

    if (!formulaExistente) {
      throw new Error("Fórmula no encontrada");
    }

    await this.formulaRepository.delete(idFormula);
    return true;
  }
}

export default new FormulaProductoService();

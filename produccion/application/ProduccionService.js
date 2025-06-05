import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import sequelize from "../../database/database.js";
import SequelizeFormulaRepository from "../../inventario/infrastructure/repositories/FormulaProductoRepository.js";
import InventarioRepository from "../../inventario/infrastructure/repositories/InventarioRepository.js";
import LogInventarioRepository from "../../inventario/infrastructure/repositories/LogInventarioRepository.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import { obtenerFechaActualChile } from "../../shared/utils/fechaUtils.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import ConsumoInsumoRepository from "../infrastructure/repositories/ConsumoInsumoRepository.js";
import ProduccionRepository from "../infrastructure/repositories/ProduccionRepository.js";

class ProduccionService {
  constructor() {
    this.formulaRepository = new SequelizeFormulaRepository();
  }
  async crear({ id_formula, cantidad_lote, rut_usuario }) {
    if (!id_formula || !cantidad_lote || cantidad_lote <= 0) {
      throw new Error(
        "Parámetros inválidos: id_formula y cantidad_lote > 0 son obligatorios"
      );
    }

    const formula = await this.formulaRepository.findById(id_formula);
    if (!formula) {
      throw new Error("Fórmula no encontrada");
    }

    const detalles = formula.FormulaProductoDetalles.map((d) => ({
      id_insumo: d.id_insumo,
      requerido: Number(d.cantidad_requerida) * cantidad_lote,
      unidad: d.unidad_de_medida || "u.",
    }));

    for (const det of detalles) {
      const inv = await InventarioRepository.findByInsumoId(det.id_insumo);
      if (!inv || inv.cantidad < det.requerido) {
        throw new Error(`Stock insuficiente para insumo ID ${det.id_insumo}`);
      }
    }

    return await sequelize.transaction(async (transaction) => {
      const produccion = await ProduccionRepository.create(
        {
          id_formula,
          cantidad_lote,
          unidades_fabricadas: Math.round(
            cantidad_lote * Number(formula.cantidad_requerida)
          ),
          rut_usuario,
          fecha_produccion: obtenerFechaActualChile(),
        },
        { transaction }
      );

      await ConsumoInsumoRepository.bulkCreate(
        detalles.map((det) => ({
          id_produccion: produccion.id_produccion,
          id_insumo: det.id_insumo,
          cantidad_consumida: Math.round(det.requerido),
          unidad_medida: det.unidad,
        })),
        { transaction }
      );

      for (const det of detalles) {
        const invInsumo = await InventarioRepository.findByInsumoId(
          det.id_insumo,
          { transaction }
        );

        await invInsumo.decrement("cantidad", {
          by: Math.round(det.requerido),
          transaction,
        });

        const cantidadAnterior = invInsumo.cantidad;
        const cantidadConsumida = Math.round(det.requerido);

        await LogInventarioRepository.createLog(
          {
            id_producto: null,
            id_insumo: det.id_insumo,
            cambio: -cantidadConsumida,
            cantidad_final: cantidadAnterior - cantidadConsumida,
            motivo: "Consumo en producción",
            realizado_por: rut_usuario,
            fecha: new Date(),
          },
          { transaction }
        );
      }

      const unidades = Number.parseInt(produccion.unidades_fabricadas);
      console.log("UNIDADES (typeof):", typeof unidades, unidades);
      const invProd = await InventarioRepository.findByProductoId(
        formula.id_producto_final,
        { transaction }
      );

      if (invProd) {
        await invProd.increment("cantidad", { by: unidades, transaction });
      } else {
        await InventarioRepository.create(
          {
            id_producto: formula.id_producto_final,
            cantidad: unidades,
          },
          { transaction }
        );
      }

      const cantidadAnterior = invProd ? invProd.cantidad : 0;
      const cantidadIngresada = unidades;

      await LogInventarioRepository.createLog(
        {
          id_producto: formula.id_producto_final,
          id_insumo: null,
          cambio: cantidadIngresada,
          cantidad_final: cantidadAnterior + cantidadIngresada,
          motivo: "Ingreso por producción",
          realizado_por: rut_usuario,
          fecha: new Date(),
        },
        { transaction }
      );

      return produccion;
    });
  }

  async listar(filters = {}, { page = 1, limit = 20 } = {}) {
    const allowedFields = [
      "rut_usuario",
      "cantidad_lote",
      "unidades_fabricadas",
      "fecha_produccion",
      "activo",
    ];
    const where = createFilter(filters, allowedFields);
    const include = [
      {
        model: this.formulaRepository.getModel(),
        as: "formula",
        include: [
          {
            model: ProductosRepository.getModel(), 
            as: "Producto",
            attributes: ["id_producto", "nombre_producto"],
          },
        ],
      },
      {
        model: UsuariosRepository.getModel(),
        as: "operario",
        attributes: ["rut", "nombre", "apellido"],
      },
    ];
    const result = await paginate(
      ProduccionRepository.getModel(),
      { page, limit },
      {
        where,
        include,
        order: [["fecha_produccion", "DESC"]],
        subQuery: false,
      }
    );
    return result;
  }

  async detalle(id_produccion) {
    return await ProduccionRepository.findById(id_produccion);
  }

}

export default ProduccionService;

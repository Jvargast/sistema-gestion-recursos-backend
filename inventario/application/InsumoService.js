import { col, fn, Op } from "sequelize";
import createFilter from "../../shared/utils/helpers.js";
import InsumoRepository from "../infrastructure/repositories/InsumoRepository.js";
import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";
import TipoInsumoService from "./TipoInsumoService.js";
import TipoInsumoRepository from "../infrastructure/repositories/TipoInsumoRepository.js";
import paginate from "../../shared/utils/pagination.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import SequelizeFormulaRepository from "../infrastructure/repositories/FormulaProductoRepository.js";
import SequelizeFormulaDetalleRepository from "../infrastructure/repositories/FormulaDetalleProductoRepository.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InsumoService {
  constructor() {
    this.formulaRepository = new SequelizeFormulaRepository();
    this.formulaDetalleRepository = new SequelizeFormulaDetalleRepository();
  }

  async getInsumoById(id) {
    const insumo = await InsumoRepository.findById(id);
    if (!insumo) throw new Error("Insumo no encontrado.");
    return insumo;
  }
  async getStocksForInsumos({ ids, idSucursal = null }) {
    const where = {
      id_insumo: { [Op.in]: ids },
    };
    if (idSucursal != null) {
      where.id_sucursal = idSucursal;
    }

    const rows = await InventarioRepository.getModel().findAll({
      attributes: ["id_insumo", [fn("SUM", col("cantidad")), "cantidad"]],
      where,
      group: ["id_insumo"],
      raw: true,
    });

    return rows;
  }

  async getStocksByFormula({
    idFormula,
    idSucursal = null,
    multiplicador = 1,
  }) {
    const formula = await this.formulaRepository.getModel().findByPk(
      idFormula,
      {
        include: [
          {
            model: this.formulaDetalleRepository.getModel(),
            as: "FormulaProductoDetalles",
            include: [
              {
                model: InsumoRepository.getModel(),
                as: "Insumo",
                attributes: ["id_insumo", "nombre_insumo", "unidad_de_medida"],
              },
            ],
          },
        ],
      }
    );

    if (!formula) {
      throw new Error("Fórmula no encontrada");
    }

    const detalles = (formula.FormulaProductoDetalles || []).filter(
      (d) => d?.Insumo?.id_insumo
    );

    const ids = [...new Set(detalles.map((d) => d.Insumo.id_insumo))];
    if (ids.length === 0) return [];

    const stockRows = await this.getStocksForInsumos({ ids, idSucursal });
    const stockMap = new Map(
      stockRows.map((r) => [Number(r.id_insumo), Number(r.cantidad) || 0])
    );

    const data = detalles.map((d) => {
      const id_insumo = Number(d.Insumo.id_insumo);
      const requerido =
        (Number(d.cantidad_requerida) || 0) * (Number(multiplicador) || 1);
      const stock = stockMap.get(id_insumo) ?? 0;
      return {
        id_insumo,
        nombre: d.Insumo.nombre_insumo,
        unidad: d.Insumo.unidad_de_medida || "u.",
        requerido,
        stock,
      };
    });

    return data;
  }

  async getAllInsumos(filters = {}, options) {
    const allowedFields = [
      "nombre_insumo",
      "codigo_barra",
      "descripcion",
      "precio",
      "id_tipo_insumo",
      "unidad_de_medida",
      "activo",
      "fecha_de_creacion",
    ];
    const where = createFilter(filters, allowedFields);

    if (options.tipo) {
      where["$tipo_insumo.nombre_tipo$"] = options.tipo;
    }

    if (options.search) {
      where[Op.or] = [
        { "$tipo_insumo.nombre_tipo$": { [Op.like]: `%${options.search}%` } }, // Buscar en tipo.nombre
        { codigo_barra: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
        { descripcion: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
        { nombre_insumo: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
      ];
    }

    const effectiveSucursalId =
      options.userRol !== "administrador"
        ? options.userSucursalId
        : options.id_sucursal;

    const include = [
      {
        model: TipoInsumoRepository.getModel(),
        as: "tipo_insumo",
        attributes: ["nombre_tipo", "id_tipo_insumo"],
      },
      ...(options.includeInventario !== false
        ? [
            {
              model: InventarioRepository.getModel(),
              as: "inventario",
              attributes: ["id_sucursal", "cantidad"],
              ...(effectiveSucursalId
                ? {
                    where: { id_sucursal: effectiveSucursalId },
                    required: false,
                  }
                : {}),
            },
          ]
        : []),
    ];

    /* const tipos = await TipoInsumoRepository.getModel().findAll({
      attributes: ["nombre_tipo"],
    }); */

    const tipoNombre = options.tipo;

    const result = await paginate(InsumoRepository.getModel(), options, {
      where,
      include,
      order: [["id_insumo", "ASC"]],
      subQuery: false,
      distinct: true,
    });

    return {
      tipo: options.tipo || null,
      items: result.data,
      totalItems: result.pagination.totalItems,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      pageSize: result.pagination.pageSize,
    };
  }

  async getAllInsumosAll(filters = {}, options = {}) {
    const allowedFields = [
      "nombre_insumo",
      "codigo_barra",
      "descripcion",
      "precio",
      "id_tipo_insumo",
      "unidad_de_medida",
      "activo",
      "fecha_de_creacion",
    ];
    const where = createFilter(filters, allowedFields);

    if (options.tipo) {
      where["$tipo_insumo.nombre_tipo$"] = options.tipo;
    }
    if (options.search) {
      where[Op.or] = [
        { "$tipo_insumo.nombre_tipo$": { [Op.like]: `%${options.search}%` } },
        { codigo_barra: { [Op.like]: `%${options.search}%` } },
        { descripcion: { [Op.like]: `%${options.search}%` } },
        { nombre_insumo: { [Op.like]: `%${options.search}%` } },
      ];
    }

    const effectiveSucursalId =
      options.userRol !== "administrador"
        ? options.userSucursalId
        : options.id_sucursal;

    const include = [
      {
        model: TipoInsumoRepository.getModel(),
        as: "tipo_insumo",
        attributes: ["nombre_tipo", "id_tipo_insumo"],
      },
      ...(options.includeInventario !== false
        ? [
            {
              model: InventarioRepository.getModel(),
              as: "inventario",
              attributes: ["id_sucursal", "cantidad"],
              ...(effectiveSucursalId
                ? {
                    where: { id_sucursal: effectiveSucursalId },
                    required: false,
                  }
                : {}),
            },
          ]
        : []),
    ];

    const rows = await InsumoRepository.getModel().findAll({
      where,
      include,
      order: [["id_insumo", "ASC"]],
      ...(options.limit ? { limit: options.limit } : {}),
    });

    return rows;
  }

  async getAllInsumosVendibles(filters = {}, options) {
    const allowedFields = [
      "nombre_insumo",
      "codigo_barra",
      "descripcion",
      "precio",
      "id_tipo_insumo",
      "unidad_de_medida",
      "activo",
      "fecha_de_creacion",
    ];
    const where = createFilter(filters, allowedFields);

    where.es_para_venta = true;

    if (options.tipo) {
      where["$tipo_insumo.nombre_tipo$"] = options.tipo;
    }

    if (options.search) {
      where[Op.or] = [
        { "$tipo_insumo.nombre_tipo$": { [Op.like]: `%${options.search}%` } }, // Buscar en tipo.nombre
        { codigo_barra: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
        { descripcion: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
        { nombre_insumo: { [Op.like]: `%${options.search}%` } }, // Buscar en marca
      ];
    }

    const include = [
      {
        model: TipoInsumoRepository.getModel(),
        as: "tipo_insumo",
        attributes: ["nombre_tipo"],
      },
      {
        model: InventarioRepository.getModel(),
        as: "inventario",
        attributes: ["cantidad"],
      },
    ];
    // Obtiene los tipos únicos de insumos
    const tipos = await TipoInsumoRepository.getModel().findAll({
      attributes: ["nombre_tipo"],
    });

    const tipoNombre = options.tipo;
    //const tipoWhere = { ...where, "$tipo_insumo.nombre_tipo$": tipoNombre };

    const result = await paginate(InsumoRepository.getModel(), options, {
      where,
      include,
      order: [["id_insumo", "ASC"]],
      subQuery: false,
    });

    return {
      tipo: tipoNombre,
      items: result.data,
      totalItems: result.pagination.totalItems,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      pageSize: result.pagination.pageSize,
    };
  }

  async createInsumo(data) {
    const { ...insumoData } = data;

    await TipoInsumoService.getTipoById(insumoData.id_tipo_insumo);

    const insumo = await InsumoRepository.create(insumoData);

    return await this.getInsumoById(insumo.id_insumo);
  }

  async updateInsumo(id, data, file) {
    const insumoExistente = await InsumoRepository.findById(id);
    if (!insumoExistente) {
      throw new Error(`El insumo con ID ${id} no existe.`);
    }

    let imageUrl = data.image_url || undefined;
    if (file) {
      if (
        insumoExistente.image_url &&
        insumoExistente.image_url.startsWith("/images/")
      ) {
        const oldImagePath = path.join(
          __dirname,
          "../../public",
          insumoExistente.image_url
        );
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch {}
        }
      }
      imageUrl = `/images/${file.filename}`;
    }

    const payload = {
      nombre_insumo: data.nombre_insumo,
      descripcion: data.descripcion || "",
      marca: data.marca ?? null,
      codigo_barra: data.codigo_barra || null,
      id_tipo_insumo: data.id_tipo_insumo ? Number(data.id_tipo_insumo) : null,
      es_para_venta: data.es_para_venta,
      precio: data.precio ? Number(data.precio) : null,
      unidad_de_medida: data.unidad_de_medida || null,
      image_url: imageUrl,
    };

    const [rows] = await InsumoRepository.update(id, payload);

    if (rows === 0) return insumoExistente;

    return await this.getInsumoById(id);
  }

  async deleteInsumos(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Debe proporcionar al menos un ID para eliminar.");
    }
    const insumos = await InsumoRepository.findByIds(ids);
    console.log(insumos);
    if (insumos.length !== ids.length) {
      const notFoundIds = ids.filter(
        (id) => !insumos.some((insumo) => insumo.id_insumo === id)
      );
      throw new Error(
        `Los siguientes insumos no fueron encontrados: ${notFoundIds.join(
          ", "
        )}`
      );
    }

    await InventarioRepository.delete(ids);

    await InsumoRepository.delete(ids);

    return { deleted: ids };
  }
}

export default new InsumoService();

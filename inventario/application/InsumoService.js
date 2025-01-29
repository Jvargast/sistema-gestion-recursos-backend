import { Op } from "sequelize";
import createFilter from "../../shared/utils/helpers.js";
import InsumoRepository from "../infrastructure/repositories/InsumoRepository.js";
import InventarioRepository from "../infrastructure/repositories/InventarioRepository.js";
import TipoInsumoService from "./TipoInsumoService.js";
import TipoInsumoRepository from "../infrastructure/repositories/TipoInsumoRepository.js";
import paginate from "../../shared/utils/pagination.js";

class InsumoService {
  async getInsumoById(id) {
    const insumo = await InsumoRepository.findById(id);
    if (!insumo) throw new Error("Insumo no encontrado.");
    return insumo;
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

    /* const groupedData = await Promise.all(
    tipos.map(async (tipo) => {
      const tipoNombre = tipo.nombre_tipo;
      const tipoWhere = { ...where, "$tipo_insumo.nombre_tipo$": tipoNombre };

      const result = await paginate(InsumoRepository.getModel(), options, {
        where: tipoWhere,
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
      };
    })
  ); */
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
    const { cantidad_inicial, ...insumoData } = data;

    await TipoInsumoService.getTipoById(insumoData.id_tipo_insumo);

    const insumo = await InsumoRepository.create(insumoData);

    if (
      Number(cantidad_inicial) !== undefined &&
      Number(cantidad_inicial) >= 0
    ) {
      await InventarioRepository.create({
        id_insumo: insumo.id_insumo,
        cantidad: Number(cantidad_inicial),
        activo: true,
        fecha_de_creacion: new Date(),
      });
    }
    return await this.getInsumoById(insumo.id_insumo);
  }

  async updateInsumo(id, data) {
    // Extraer codigo_barra del objeto data
    const { codigo_barra } = data;

    // Verificar que el insumo exista
    const insumoExistente = await this.getInsumoById(id);
    if (!insumoExistente) {
      throw new Error(`El insumo con ID ${id} no existe.`);
    }

    // Validar código de barra (opcional si el cliente no lo proporciona)
    if (
      codigo_barra !== undefined &&
      codigo_barra !== null &&
      codigo_barra.trim() !== ""
    ) {
      // Verificar si ya existe otro insumo con el mismo código de barra
      const insumoConCodigo = await InsumoRepository.findByCodigoBarra(
        codigo_barra
      );

      if (insumoConCodigo && insumoConCodigo.id_insumo !== id) {
        throw new Error(
          `El código de barra "${codigo_barra}" ya está en uso por el insumo con ID ${insumoConCodigo.id_insumo}.`
        );
      }
    } else {
      // Si no se envió un código de barra válido, eliminarlo del objeto data
      delete data.codigo_barra;
    }

    // Actualizar el insumo
    await InsumoRepository.update(id, data);

    // Retornar el insumo actualizado
    return await this.getInsumoById(id);
  }

  async deleteInsumos(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Debe proporcionar al menos un ID para eliminar.");
    }

    // Verifica si los insumos existen
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

    // Elimina registros relacionados en el inventario
    await InventarioRepository.delete(ids);

    // Elimina los insumos
    await InsumoRepository.delete(ids);

    return { deleted: ids };
  }
}

export default new InsumoService();

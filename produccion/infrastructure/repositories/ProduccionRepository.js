import { Op } from "sequelize";
import FormulaProducto from "../../../inventario/domain/models/FormulaProducto.js";
import ConsumoInsumo from "../../domain/models/ConsumoInsumo.js";
import Produccion from "../../domain/models/Produccion.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import { convertirALaUtc } from "../../../shared/utils/fechaUtils.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";

class ProduccionRepository {
  async findById(id_produccion) {
    return await Produccion.findByPk(id_produccion, {
      include: [
        {
          model: FormulaProducto,
          as: "formula",
          include: [
            {
              model: Producto,
              as: "Producto", 
            },
          ],
        },
        {
          model: Usuarios,
          as: "operario",
          attributes: ["rut", "nombre", "apellido"],
        },
        {
          model: ConsumoInsumo,
          as: "consumos",
          include: [
            {
              model: Insumo,
              as: "insumo",
              attributes: ["nombre_insumo", "unidad_de_medida", "id_insumo"],
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {object} param0
   */
  async findAll({ page = 1, limit = 20, from, to } = {}) {
    const where = {};
    if (from || to) {
      where.fecha_produccion = {};
      if (from) where.fecha_produccion[Op.gte] = convertirALaUtc(from).toDate();
      if (to) where.fecha_produccion[Op.lte] = convertirALaUtc(to).toDate();
    }

    return await Produccion.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [["fecha_produccion", "DESC"]],
      include: [{ model: FormulaProducto, as: "formula" }],
    });
  }

  async create(data) {
    return await Produccion.create(data);
  }

  async update(id, data) {
    return await Produccion.update(data, { where: { id_produccion: id } });
  }

  async delete(ids) {
    if (!Array.isArray(ids)) ids = [ids];
    return await Produccion.destroy({ where: { id_produccion: ids } });
  }

  getModel() {
    return Produccion;
  }
}

export default new ProduccionRepository();

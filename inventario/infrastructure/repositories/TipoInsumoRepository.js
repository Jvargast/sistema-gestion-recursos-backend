import { Op, col, fn, where as sequelizeWhere } from "sequelize";
import TipoInsumo from "../../domain/models/TipoInsumo.js";

class TipoInsumoRepository {
  async findById(id_tipo_insumo, options = {}) {
    return await TipoInsumo.findByPk(id_tipo_insumo, options);
  }

  async findAll(options = {}) {
    return await TipoInsumo.findAll({
      order: [["nombre_tipo", "ASC"]],
      ...options,
    });
  }

  async findByNombre(nombre_tipo, options = {}) {
    const nombreNormalizado = String(nombre_tipo || "").trim().toLowerCase();
    return await TipoInsumo.findOne({
      where: sequelizeWhere(fn("LOWER", col("nombre_tipo")), nombreNormalizado),
      ...options,
    });
  }

  async findByNombreExcludingId(nombre_tipo, id_tipo_insumo, options = {}) {
    const nombreNormalizado = String(nombre_tipo || "").trim().toLowerCase();
    return await TipoInsumo.findOne({
      where: {
        [Op.and]: [
          sequelizeWhere(fn("LOWER", col("nombre_tipo")), nombreNormalizado),
          { id_tipo_insumo: { [Op.ne]: id_tipo_insumo } },
        ],
      },
      ...options,
    });
  }

  async create(data, options = {}) {
    return await TipoInsumo.create(data, options);
  }

  async update(id, data, options = {}) {
    return await TipoInsumo.update(data, {
      where: { id_tipo_insumo: id },
      ...options,
    });
  }

  async delete(id, options = {}) {
    return await TipoInsumo.destroy({
      where: { id_tipo_insumo: id },
      ...options,
    });
  }

  getModel() {
    return TipoInsumo;
  }
}

export default new TipoInsumoRepository();

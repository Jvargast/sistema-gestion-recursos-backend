import Insumo from "../../domain/models/Insumo.js";
import Inventario from "../../domain/models/Inventario.js";
import TipoInsumo from "../../domain/models/TipoInsumo.js";

class InsumoRepository {
  async findById(id) {
    return await Insumo.findByPk(id, {
      include: [
        { model: TipoInsumo, as: "tipo_insumo" },
        {
          model: Inventario,
          as: "inventario",
          attributes: ["cantidad", "fecha_actualizacion"],
        },
      ],
    });
  }

  async findAll() {
    return await Insumo.findAll({
      include: [
        { model: TipoInsumo, as: "tipo_insumo" },
        {
          model: Inventario,
          as: "inventario",
          attributes: ["cantidad", "fecha_actualizacion"],
        },
      ],
    });
  }

  async create(data) {
    try {
      return await Insumo.create(data);
    } catch (error) {
      return error;
    }
  }

  async update(id, data) {
    try {
      const updated = await Insumo.update(data, { where: { id_insumo: id } });
      return updated;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async delete(ids) {
    if (!Array.isArray(ids)) {
      throw new Error("Los IDs deben ser un array.");
    }
    return await Insumo.destroy({ where: { id_insumo: ids } });
  }

  async findByIds(ids) {
    return await Insumo.findAll({
      where: { id_insumo: ids },
    });
  }

  async getByCodigoBarra(codigo_barra) {
    return await Insumo.findOne({ where: { codigo_barra } });
  }

  getModel() {
    return Insumo;
  }
}

export default new InsumoRepository();

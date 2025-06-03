import FormulaProducto from "../../domain/models/FormulaProducto.js";
import FormulaProductoDetalle from "../../domain/models/FormulaProductoDetalle.js";
import Insumo from "../../domain/models/Insumo.js";

class SequelizeFormulaDetalleRepository {
  getModel() {
    return FormulaProductoDetalle;
  }
  async findAll() {
    return await FormulaProductoDetalle.findAll({
      include: [
        {
          model: FormulaProducto,
          as: "formula",
        },
        {
          model: Insumo,
          as: "insumo",
        },
      ],
    });
  }

  async findByFormulaId(id_formula) {
    return await FormulaProductoDetalle.findAll({
      where: { id_formula },
      include: [
        {
          model: Insumo,
          as: "Insumo",
        },
      ],
    });
  }

  async findById(id_formula_detalle) {
    return await FormulaProductoDetalle.findByPk(id_formula_detalle, {
      include: [
        {
          model: FormulaProducto,
          as: "formula",
        },
        {
          model: Insumo,
          as: "insumo",
        },
      ],
    });
  }

  async create(detalleData) {
    return await FormulaProductoDetalle.create(detalleData);
  }

  async bulkCreate(detallesData) {
    return await FormulaProductoDetalle.bulkCreate(detallesData);
  }

  async update(id, detalleData) {
    const detalle = await FormulaProductoDetalle.findByPk(id);
    if (!detalle) {
      return null;
    }
    return await detalle.update(detalleData);
  }

  async delete(id) {
    const detalle = await FormulaProductoDetalle.findByPk(id);
    if (!detalle) {
      return false;
    }
    await detalle.destroy();
    return true;
  }
}

export default SequelizeFormulaDetalleRepository;

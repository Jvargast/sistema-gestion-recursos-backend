import FormulaProducto from "../../domain/models/FormulaProducto.js";
import FormulaProductoDetalle from "../../domain/models/FormulaProductoDetalle.js";
import Insumo from "../../domain/models/Insumo.js";
import Inventario from "../../domain/models/Inventario.js";
import Producto from "../../domain/models/Producto.js";

class SequelizeFormulaRepository {
  async findAll() {
    return await FormulaProducto.findAll({
      include: [{ model: Producto }, { model: Insumo }],
    });
  }

  async findByProductoId(idProducto) {
    return await FormulaProducto.findAll({
      where: { id_producto_final: idProducto },
      include: [{ model: Producto }, { model: Insumo }],
    });
  }

  async findById(id) {
    return await FormulaProducto.findByPk(id, {
      include: [
        {
          model: Producto,
          as: "Producto",
        },
        {
          model: FormulaProductoDetalle,
          as: "FormulaProductoDetalles",
          include: [
            {
              model: Insumo,
              as: "Insumo",
              include: [
                {
                  model: Inventario,
                  as: "inventario",
                  attributes: ["cantidad"],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async create(formulaData) {
    return await FormulaProducto.create(formulaData);
  }

  async bulkCreate(formulasArray) {
    return await FormulaProducto.bulkCreate(formulasArray);
  }

  async update(id, formulaData) {
    const formula = await FormulaProducto.findByPk(id);
    if (!formula) {
      return null;
    }
    return await formula.update(formulaData);
  }

  async delete(id) {
    const formula = await FormulaProducto.findByPk(id);
    if (!formula) {
      return false;
    }
    await formula.destroy();
    return true;
  }

  getModel() {
    return FormulaProducto;
  }
}

export default SequelizeFormulaRepository;

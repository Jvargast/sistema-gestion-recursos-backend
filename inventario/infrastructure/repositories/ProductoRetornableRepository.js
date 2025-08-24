import ProductoRetornable from "../../domain/models/ProductoRetornable.js";
import Producto from "../../domain/models/Producto.js";
import Insumo from "../../domain/models/Insumo.js";
import { Op } from "sequelize";

class ProductoRetornableRepository {
  async findById(id) {
    return await ProductoRetornable.findByPk(id, {
      include: [
        { model: Producto, as: "Producto" },
        { model: Insumo, as: "Insumo" },
      ],
    });
  }

  async findAll(filters = {}, options = {}) {
    const { search, ...rest } = options;

    const where = { ...filters };

    if (search && String(search).trim() !== "") {
      const term = String(search).trim();
      where[Op.or] = [
        { "$Producto.nombre_producto$": { [Op.iLike]: `%${term}%` } },
        { "$Insumo.nombre_insumo$": { [Op.iLike]: `%${term}%` } },
      ];
    }

    return await ProductoRetornable.findAll({
      where,
      include: [
        {
          model: Producto,
          as: "Producto",
          attributes: ["id_producto", "nombre_producto", "id_insumo_retorno"],
          include: [
            {
              model: Insumo,
              as: "insumo_retorno",
              attributes: ["id_insumo", "nombre_insumo"],
            },
          ],
        },
        { model: Insumo, as: "Insumo" },
      ],
      ...rest,
    });
  }

  async create(data) {
    try {
      return await ProductoRetornable.create(data);
    } catch (error) {
      console.log("Error en el repositorio: ", error.message);
      throw error;
    }
  }

  async update(id, data) {
    return await ProductoRetornable.update(data, {
      where: { id_producto_retornable: id },
    });
  }

  async updateByProductoOInsumo(id_producto, id_insumo, data, options = {}) {
    const where = {};
    if (id_producto !== null && id_producto !== undefined) {
      where.id_producto = id_producto;
    } else {
      where.id_insumo = id_insumo;
    }

    return await ProductoRetornable.update(data, {
      where,
      ...options,
    });
  }

  async delete(id) {
    return await ProductoRetornable.destroy({
      where: { id_producto_retornable: id },
    });
  }

  async findByEstado(estado) {
    return await ProductoRetornable.findAll({
      where: { estado },
      include: [
        { model: Producto, as: "Producto" },
        { model: Insumo, as: "Insumo" },
      ],
    });
  }

  getModel() {
    return ProductoRetornable;
  }
}

export default new ProductoRetornableRepository();

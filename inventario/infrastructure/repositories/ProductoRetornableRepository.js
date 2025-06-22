import ProductoRetornable from "../../domain/models/ProductoRetornable.js";
import Producto from "../../domain/models/Producto.js";
import Insumo from "../../domain/models/Insumo.js";
import Entrega from "../../../Entregas/domain/models/Entrega.js";
import Camion from "../../../Entregas/domain/models/Camion.js";

class ProductoRetornableRepository {
  async findById(id) {
    return await ProductoRetornable.findByPk(id, {
      include: [
        { model: Producto, as: "Producto" },
        { model: Insumo, as: "insumo" },
        { model: Entrega, as: "entrega" },
        { model: Camion, as: "camion" },
      ],
    });
  }

  async findAll(filters = {}, options = {}) {
    return await ProductoRetornable.findAll({
      where: filters,
      include: [
        { model: Producto, as: "Producto" },
        { model: Insumo, as: "insumo" },
        { model: Entrega, as: "entrega" },
        { model: Camion, as: "camion" },
      ],
      ...options,
    });
  }

  async create(data) {
    try {
      return await ProductoRetornable.create(data);
    } catch (error) {
      console.log("Error en el repositorio: ",error.message);
      throw error;
    }
  }

  async update(id, data) {
    return await ProductoRetornable.update(data, {
      where: { id_producto_retornable: id },
    });
  }

  async updateByCamionAndProducto(id_camion, id_producto, data, options = {}) {
    return await ProductoRetornable.update(data, {
      where: { id_camion, id_producto },
      ...options,
    });
  }

  async delete(id) {
    return await ProductoRetornable.destroy({
      where: { id_producto_retornable: id },
    });
  }

  async findByEstado(estado) {
    return await ProductoRetornable.findAll({ where: { estado } });
  }


  getModel() {
    return ProductoRetornable;
  }
}

export default new ProductoRetornableRepository();

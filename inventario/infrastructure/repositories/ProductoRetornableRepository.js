import ProductoRetornable from "../../domain/models/ProductoRetornable.js";
import Producto from "../../domain/models/Producto.js";
import Cliente from "../../../ventas/domain/models/Cliente.js";

class ProductoRetornableRepository {
  async findById(id) {
    return await ProductoRetornable.findByPk(id, {
      include: [
        { model: Producto, as: "producto" },
        { model: Cliente, as: "cliente" },
      ],
    });
  }

  async findAll() {
    return await ProductoRetornable.findAll({
      include: [
        { model: Producto, as: "producto" },
        { model: Cliente, as: "cliente" },
      ],
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

  async delete(id) {
    return await ProductoRetornable.destroy({
      where: { id_producto_retornable: id },
    });
  }

  async findByEstado(estado) {
    return await ProductoRetornable.findAll({ where: { estado } });
  }

  async findByCliente(clienteId) {
    return await ProductoRetornable.findAll({
      where: { id_cliente: clienteId },
    });
  }

  getModel() {
    return ProductoRetornable;
  }
}

export default new ProductoRetornableRepository();

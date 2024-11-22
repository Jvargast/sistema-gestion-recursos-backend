import IProductoRepository from "../../domain/repositories/IProductoRepository.js";
import Producto from "../../domain/models/Producto.js";
import CategoriaProducto from "../../domain/models/CategoriaProducto.js";
import EstadoProducto from "../../domain/models/EstadoProducto.js";
import TipoProducto from "../../domain/models/TipoProducto.js";
import Inventario from "../../domain/models/Inventario.js";

class ProductoRepository extends IProductoRepository {
  async findById(id) {
    return await Producto.findByPk(id, {
      include: [
        { model: CategoriaProducto, as: "categoria" },
        { model: EstadoProducto, as: "estado" },
        { model: TipoProducto, as: "tipo" },
      ],
    });
  }

  async findAll() {
    return await Producto.findAll({
      include: [
        { model: CategoriaProducto, as: "categoria" },
        { model: EstadoProducto, as: "estado" },
        { model: TipoProducto, as: "tipo" },
        {
          model: Inventario, //Se incluye para optimizar la consulta, solo prueba
          as: "inventario",
          attributes: ["cantidad", "fecha_actualizacion"], // Solo los campos necesarios
        },
      ],
    });
  }

  async create(data) {
    return await Producto.create(data);
  }

  async update(id, data) {
    return await Producto.update(data, { where: { id_producto: id } });
  }

  async delete(id) {
    return await Producto.destroy({ where: { id_producto: id } });
  }

  getModel() {
    return Transaccion;
  }
}

export default new ProductoRepository();

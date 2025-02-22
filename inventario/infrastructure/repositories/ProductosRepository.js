import IProductoRepository from "../../domain/repositories/IProductoRepository.js";
import Producto from "../../domain/models/Producto.js";
import CategoriaProducto from "../../domain/models/CategoriaProducto.js";
import EstadoProducto from "../../domain/models/EstadoProducto.js";
import Inventario from "../../domain/models/Inventario.js";

class ProductoRepository extends IProductoRepository {
  async findById(id) {
    return await Producto.findByPk(id, {
      include: [
        { model: CategoriaProducto, as: "categoria" },
        { model: EstadoProducto, as: "estadoProducto" },
        {
          model: Inventario, //Se incluye para optimizar la consulta, solo prueba
          as: "inventario",
          attributes: ["cantidad", "fecha_actualizacion"], // Solo los campos necesarios
        },
      ],
    });
  }

  async findAll() {
    return await Producto.findAll({
      include: [
        { model: CategoriaProducto, as: "categoria" },
        { model: EstadoProducto, as: "estadoProducto" },

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

  async findProductosByEstado(estado) {
    return await Producto.findAll({ where: { id_estado_producto: estado } });
  }

  async updateEstadoProducto(idProducto, estado) {
    return await Producto.update(
      { id_estado_producto: estado },
      { where: { id_producto: idProducto } }
    );
  }

  async findProductosDisponibles() {
    return await Producto.findAll({ where: { id_estado_producto: 1 } }); // 1 = "Disponible"
  }

  async findByIds(ids) {
    return await Producto.findAll({
      where: { id_producto: ids },
    });
  }

  async findByNombre(nombre_producto) {
    return await Producto.findOne({ where: { nombre_producto } });
  }

  async findByCodigo(codigo_barra) {
    return await Producto.findOne({ where: { codigo_barra } });
  }

  getModel() {
    return Producto;
  }
}

export default new ProductoRepository();

// InventarioCamionRepository.js

import { Op } from "sequelize";
import Producto from "../../../inventario/domain/models/Producto.js";
import Camion from "../../domain/models/Camion.js";
import InventarioCamion from "../../domain/models/InventarioCamion.js";

class InventarioCamionRepository {
  async create(data) {
    return await InventarioCamion.create(data);
  }

  async findOneProduct(id_camion, id_producto) {
    return await InventarioCamion.findOne({
      where: { id_camion, id_producto },
    });
  }

  async findById(id) {
    return await InventarioCamion.findByPk(id, {
      include: [
        { model: Camion, as: "camion" },
        { model: Producto, as: "producto" },
      ],
    });
  }

  async findAll() {
    return await InventarioCamion.findAll({
      include: [
        { model: Camion, as: "camion" },
        { model: Producto, as: "producto" },
      ],
    });
  }

  async findAllProducts(condition) {
    return await InventarioCamion.findAll(condition);
  }

  async findByCamionId(idCamion) {
    return await InventarioCamion.findAll({
      where: {
        id_camion: idCamion,
        estado: {
          [Op.notIn]: ["Regresado", "Entregado"],
        },
      },
      include: [
        {
          model: Producto,
          as: "producto",
          attributes: ["id_producto", "nombre_producto", "precio"],
        },
      ],
    });
  }

  async findByProductoAndEstado(id_producto, estado, id_camion) {
    return await InventarioCamion.findOne({
      where: {
        id_producto,
        estado,
        id_camion,
      },
    });
  }
  async findAllByCamionAndEstado(id_camion, estado) {
    return InventarioCamion.findAll({
      where: {
        id_camion,
        estado,
      },
    });
  }

  async update(id, data) {
    const inventario = await InventarioCamion.update(data, {
      where: { id_producto: id },
    });
    if (!inventario) {
      throw new Error("InventarioCamion not found");
    }
    return inventario;
  }

  async updateCantidad(id_camion, id_producto, cantidad) {
    return await InventarioCamion.update(
      { cantidad },
      { where: { id_camion, id_producto } }
    );
  }

  async updateById(id, data) {
    const inventario = await InventarioCamion.update(data, {
      where: { id_inventario_camion: id },
    });
    if (!inventario) {
      throw new Error("InventarioCamion not found");
    }
    return inventario;
  }

  async delete(id) {
    const inventario = await InventarioCamion.findByPk(id);
    if (!inventario) {
      throw new Error("InventarioCamion not found");
    }
    return await inventario.destroy();
  }
  /* 
  async findByDetalle(id_detalle_transaccion, id_camion) {
    return await InventarioCamion.findOne({
      where: {
        id_detalle_transaccion,
        id_camion,
        estado: "En Camión - Reservado",
      },
      include: [
        {
          model: DetalleTransaccion,
          as: "detalleTransaccion",
        },
      ],
    });
  } */

  async findByCamionProductoAndEstado(id_camion, id_producto, estado) {
    return await InventarioCamion.findOne({
      where: {
        id_camion,
        id_producto,
        estado,
      },
    });
  }

  async findAllByCamionId(id_camion) {
    return await InventarioCamion.findAll({
      where: { id_camion },
      include: [
        {
          model: Producto,
          as: "producto",
          attributes: [
            "id_producto",
            "nombre_producto",
            "precio",
            "es_retornable",
          ],
        },
      ],
    });
  }

  async findByCamionAndProduct(id_camion, id_producto) {
    return await InventarioCamion.findOne({
      where: { id_camion, id_producto },
    });
  }

  async deleteProductInCamion(id_camion, id_producto) {
    return await InventarioCamion.destroy({
      where: { id_camion, id_producto },
    });
  }

  getModel() {
    return InventarioCamion;
  }
}

export default new InventarioCamionRepository();

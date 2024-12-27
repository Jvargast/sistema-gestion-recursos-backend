import { Op } from "sequelize";
import InventarioService from "../../inventario/application/InventarioService.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";

class InventarioCamionService {
  async retornarProductosAdicionales(id_camion) {
    const productosCamion = await InventarioCamionRepository.findAll({
      where: {
        id_camion,
        estado: {
          [Op.or]: ["En Camión - Disponible"],
        },
      },
    });

    for (const producto of productosCamion) {
      await InventarioService.incrementStock(
        producto.id_producto,
        producto.cantidad
      );

      //Marcar como regresado
      await InventarioCamionRepository.update(producto.id_producto, {
        estado: "Regresado",
      });
    }
    return {
      message: "Productos regresados al inventario",
      productosDevueltos: productosCamion.map((p) => ({
        id_producto: p.id_producto,
        cantidad: p.cantidad,
      })),
    };
  }

  async addProductToCamion(data, esReservado = false) {
    const { id_camion, id_producto, cantidad } = data;

    if (!id_camion || !id_producto || !cantidad) {
      throw new Error(
        "Missing required fields: idCamion, idProducto, cantidad"
      );
    }

    // Verificar inventario principal
    const inventario = await InventarioService.getInventarioByProductoId(
      id_producto
    );
    if (inventario.cantidad < cantidad) {
      throw new Error("Insufficient stock for product");
    }

    // Reducir inventario principal
    await InventarioService.decrementarStock(id_producto, cantidad);

    const estado = esReservado
      ? "En Camión - Reservado"
      : "En Camión - Disponible";
    // Agregar producto al inventario del camión
    return await InventarioCamionRepository.create({
      id_camion: id_camion,
      id_producto: id_producto,
      cantidad,
      estado,
    });
  }
  async getProductsByCamion(idCamion) {
    return await InventarioCamionRepository.findByCamionId(idCamion);
  }

  async updateProductInCamion(id, data) {
    return await InventarioCamionRepository.update(id, data);
  }

  async removeProductFromCamion(id) {
    const inventarioCamion = await InventarioCamionRepository.findById(id);
    if (!inventarioCamion) {
      throw new Error("InventarioCamion not found");
    }

    // Regresar el producto al inventario principal si no está vendido
    if (inventarioCamion.estado !== "Vendido") {
      await InventarioService.incrementStock(
        inventarioCamion.id_producto,
        inventarioCamion.cantidad
      );
    }

    return await InventarioCamionRepository.delete(id);
  }
}

export default new InventarioCamionService();

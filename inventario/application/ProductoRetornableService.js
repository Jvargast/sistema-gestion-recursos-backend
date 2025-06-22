import InventarioCamionRepository from "../../Entregas/infrastructure/repositories/InventarioCamionRepository.js";
import ProductoRetornableRepository from "../infrastructure/repositories/ProductoRetornableRepository.js";
import InventarioService from "./InventarioService.js";
import ProductosService from "./ProductosService.js";

class ProductoRetornableService {
  async getProductoRetornableById(id) {
    const productoRetornable = await ProductoRetornableRepository.findById(id);
    if (!productoRetornable)
      throw new Error("Producto retornable no encontrado.");
    return productoRetornable;
  }

  async getAllProductosRetornables(filters = {}, options = {}) {
    return await ProductoRetornableRepository.findAll(filters, options);
  }

  async createProductoRetornable(data) {
    const { id_producto, ...productoRetornableData } = data;

    await ProductosService.getProductoById(id_producto);

    return await ProductoRetornableRepository.create({
      id_producto,
      ...productoRetornableData,
    });
  }

  async updateProductoRetornable(id, data) {
    await this.getProductoRetornableById(id);
    await ProductoRetornableRepository.update(id, data);
    return await this.getProductoRetornableById(id);
  }

  async deleteProductoRetornable(id) {
    await ProductoRetornableRepository.delete(id);
    return true;
  }

  async inspeccionarRetornables(
    id_camion,
    retornablesInspeccionados,
    transaction
  ) {
    for (const item of retornablesInspeccionados) {
      // item: { id_producto, cantidad, estado (reutilizable/defectuoso), tipo_defecto? }

      // Actualiza el registro existente en ProductoRetornable
      await ProductoRetornableRepository.updateByCamionAndProducto(
        id_camion,
        item.id_producto,
        {
          estado: item.estado,
          tipo_defecto: item.estado === "defectuoso" ? item.tipo_defecto : null,
        },
        { transaction }
      );

      if (item.estado === "reutilizable") {
        await InventarioService.incrementStock(
          item.id_producto,
          item.cantidad,
          { transaction }
        );
      }

      // Elimina del inventario del camión
      await InventarioCamionRepository.deleteProductInCamion(
        id_camion,
        item.id_producto,
        "En Camión - Retorno",
        transaction
      );
    }
  }
}

export default new ProductoRetornableService();

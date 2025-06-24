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

  async inspeccionarRetornables(items) {
    const transaction = await sequelize.transaction();

    try {
      for (const item of items) {
        const original = await ProductoRetornableRepository.findById(
          item.id_producto_retornable
        );

        if (!original || original.estado !== "pendiente_inspeccion") {
          throw new Error(
            `Producto retornable #${item.id_producto_retornable} no válido.`
          );
        }

        const totalDefectuosos = (item.defectuosos || []).reduce(
          (sum, d) => sum + (d.cantidad || 0),
          0
        );

        const totalAsignado = (item.reutilizable || 0) + totalDefectuosos;

        if (totalAsignado > original.cantidad) {
          throw new Error(
            `La suma total para el producto retornable #${item.id_producto_retornable} excede la cantidad disponible.`
          );
        }

        // === 1. Aumentar al inventario como insumo si corresponde ===
        if (item.reutilizable > 0) {
          if (!item.id_insumo_destino) {
            throw new Error(
              `Debe especificar un insumo destino para reutilizar el producto retornable #${item.id_producto_retornable}`
            );
          }

          // Validar que el insumo destino existe
          const insumoDestinoExiste = await InventarioService.getInventarioByInsumoId(
            item.id_insumo_destino
          );
          if (!insumoDestinoExiste) {
            throw new Error(
              `El insumo destino con ID ${item.id_insumo_destino} no existe.`
            );
          }

          await InventarioService.incrementStockInsumo(
            item.id_insumo_destino,
            item.reutilizable,
            { transaction }
          );
        }

        // === 2. Registrar defectuosos (producto o insumo) ===
        if (item.defectuosos && item.defectuosos.length > 0) {
          for (const d of item.defectuosos) {
            if (!d.tipo_defecto || !d.cantidad || d.cantidad <= 0) {
              throw new Error(
                `Cada defecto debe tener tipo y cantidad válida para el producto retornable #${item.id_producto_retornable}`
              );
            }

            await ProductoRetornableRepository.create(
              {
                id_producto: original.id_producto || null,
                id_insumo: original.id_insumo || null,
                cantidad: d.cantidad,
                tipo_defecto: d.tipo_defecto,
                estado: "defectuoso",
                fecha_inspeccion: new Date(),
              },
              { transaction }
            );
          }
        }

        await ProductoRetornableRepository.delete(item.id_producto_retornable, {
          transaction,
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new ProductoRetornableService();

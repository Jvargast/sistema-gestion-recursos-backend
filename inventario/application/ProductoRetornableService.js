import sequelize from "../../database/database.js";
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

  async getAllProductosRetornablesPaginated(filters = {}, options = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Number(options.limit) || 20);
    const offset = (page - 1) * limit;

    return await ProductoRetornableRepository.getModel().findAndCountAll(
      filters,
      {
        search: options.search,
        limit,
        offset,
        order: options.order || [["fecha_retorno", "DESC"]],
      }
    );
  }

  async getAllProductosRetornables(filters = {}, options = {}) {
    return await ProductoRetornableRepository.findAll(filters, {
      search: options.search,
      order: options.order || [["fecha_retorno", "DESC"]],
    });
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

  async inspeccionarRetornables(id_sucursal_inspeccion, items) {
    if (!id_sucursal_inspeccion) {
      throw new Error("id_sucursal_inspeccion es requerido.");
    }
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

        const reutilizable = Number(item.reutilizable) || 0;
        const totalAsignado = reutilizable + totalDefectuosos;

        if (totalAsignado > original.cantidad) {
          throw new Error(
            `La suma total para el retornable #${item.id_producto_retornable} excede la cantidad disponible (${original.cantidad}).`
          );
        }

        if (item.reutilizable > 0) {
          if (!item.id_insumo_destino) {
            throw new Error(
              `Debe especificar un insumo destino para reutilizar el producto retornable #${item.id_producto_retornable}`
            );
          }

          const insumoDestinoExiste =
            await InventarioService.getInventarioByInsumoId(
              item.id_insumo_destino,
              id_sucursal_inspeccion
            );
          if (!insumoDestinoExiste) {
            throw new Error(
              `El insumo destino con ID ${item.id_insumo_destino} no existe.`
            );
          }

          await InventarioService.incrementStockInsumo(
            item.id_insumo_destino,
            id_sucursal_inspeccion,
            item.reutilizable,
            { transaction }
          );
        }

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
                id_insumo: item.id_insumo_destino || original.id_insumo || null,
                id_venta: original.id_venta || null,
                id_sucursal_recepcion: original.id_sucursal_recepcion,
                id_sucursal_inspeccion,
                cantidad: d.cantidad,
                tipo_defecto: d.tipo_defecto,
                estado: "defectuoso",
                fecha_inspeccion: new Date(),
              },
              { transaction }
            );
          }
        }

        const cantidadRestante = original.cantidad - totalAsignado;

        if (cantidadRestante === 0) {
          await ProductoRetornableRepository.delete(
            item.id_producto_retornable,
            {
              transaction,
            }
          );
        } else {
          await ProductoRetornableRepository.update(
            item.id_producto_retornable,
            {
              cantidad: cantidadRestante,
              estado: "pendiente_inspeccion",
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new ProductoRetornableService();

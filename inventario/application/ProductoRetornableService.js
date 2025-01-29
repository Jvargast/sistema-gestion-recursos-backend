import ClienteService from "../../ventas/application/ClienteService.js";
import ProductoRetornableRepository from "../infrastructure/repositories/ProductoRetornableRepository.js";
import ProductosService from "./ProductosService.js";

class ProductoRetornableService {
    async getProductoRetornableById(id) {
      const productoRetornable = await ProductoRetornableRepository.findById(id);
      if (!productoRetornable) throw new Error("Producto retornable no encontrado.");
      return productoRetornable;
    }
  
    async getAllProductosRetornables(filters = {}, options) {
      return await ProductoRetornableRepository.findAll({ filters, options });
    }
  
    async createProductoRetornable(data) {
      const { id_producto, id_cliente, ...productoRetornableData } = data;
  
      await ProductosService.getProductoById(id_producto);
      await ClienteService.getClienteById(id_cliente);
  
      return await ProductoRetornableRepository.create({
        id_producto,
        id_cliente,
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
  }
  
  export default new ProductoRetornableService();
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import LogVenta from "../../domain/models/LogVenta.js";
import Venta from "../../domain/models/Venta.js";

class LogVentaRepository {
    async findById(id, options = {}) {
      try {
        return await LogVenta.findByPk(id, {
          include: [
            { model: Venta, as: "venta" },
            { model: Usuarios, as: "usuario" },
          ],
          ...options,
        });
      } catch (error) {
        console.error("Error en LogVentaRepository.findById:", error.message);
        throw error;
      }
    }
  
    async findAll(filters = {}, options = {}) {
      const limit = options.limit || null;
      const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;
  
      return await LogVenta.findAndCountAll({
        where: filters,
        limit,
        offset,
        include: [
          { model: Venta, as: "venta" },
          { model: Usuarios, as: "usuario" },
        ],
      });
    }
  
    async create(data, options = {}) {
      return await LogVenta.create(data, options);
    }
  
    getModel() {
      return LogVenta;
    }
  }
  export default new LogVentaRepository();

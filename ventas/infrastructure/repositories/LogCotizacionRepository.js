import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Cotizacion from "../../domain/models/Cotizacion.js";
import LogCotizacion from "../../domain/models/LogCotizacion.js";

class LogCotizacionRepository {
    async findById(id) {
      try {
        return await LogCotizacion.findByPk(id, {
          include: [
            { model: Cotizacion, as: "cotizacion" },
            { model: Usuarios, as: "usuario" },
          ],
        });
      } catch (error) {
        console.error("Error en LogCotizacionRepository.findById:", error.message);
        throw error;
      }
    }
  
    async findAll(filters = {}, options = {}) {
      const limit = options.limit || null;
      const offset = options.page ? (options.page - 1) * (options.limit || 0) : 0;
  
      return await LogCotizacion.findAndCountAll({
        where: filters,
        limit,
        offset,
        include: [
          { model: Cotizacion, as: "cotizacion" },
          { model: Usuarios, as: "usuario" },
        ],
      });
    }
  
    async create(data) {
      return await LogCotizacion.create(data);
    }
  
    getModel() {
      return LogCotizacion;
    }
  }
  
  export default new LogCotizacionRepository();
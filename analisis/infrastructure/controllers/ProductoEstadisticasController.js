import ProductoEstadisticasService from "../../application/ProductoEstadisticasService.js";

class ProductoEstadisticasController {
  // Obtener estadísticas de un producto por año
  async obtenerPorProductoYAno(req, res) {
    try {
      const { id_producto, year } = req.params;
      const estadisticas =
        await ProductoEstadisticasService.obtenerEstadisticasPorProductoYAno(
          id_producto,
          year
        );
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  // Obtener estadísticas por ID
  async getEstadisticasPorId(req, res) {
    try {
      const { id } = req.params;
      const estadisticas =
        await ProductoEstadisticasService.obtenerEstadisticasPorId(id);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Obtener todas las estadísticas con paginación
  async getAllEstadisticas(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const estadisticas =
        await ProductoEstadisticasService.obtenerTodasEstadisticas(filters, {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
        });
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerPorProductoYMes(req, res) {
    try {
      const { id_producto, year, month } = req.params;
      const estadisticas =
        await ProductoEstadisticasService.obtenerEstadisticasPorProductoYMes(
          id_producto,
          year,
          month
        );
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async monitorearProductosRecientes(req, res) {
    try {
      const productosRecientes =
        await ProductoEstadisticasService.monitorearProductosRecientes();
      res.status(200).json(productosRecientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Crear estadísticas
  async createEstadisticas(req, res) {
    try {
      const data = req.body;
      const estadisticas = await ProductoEstadisticasService.crearEstadisticas(
        data
      );
      res.status(201).json(estadisticas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Actualizar estadísticas
  async updateEstadisticas(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const estadisticas =
        await ProductoEstadisticasService.actualizarEstadisticas(id, data);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Calcular estadísticas para un producto
  async calcularEstadisticas(req, res) {
    try {
      const { id_producto, year } = req.body;
      const estadisticas =
        await ProductoEstadisticasService.calcularEstadisticasPorProducto(
          id_producto,
          year
        );
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Calcular estadisticas por año
  async calcularEstadisticasPorAno(req, res) {
    try {
      const { year } = req.body;
      const estadisticas =
        await ProductoEstadisticasService.calcularEstadisticasPorAno(year);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Actualizar estadisticas por producto
  async updateEstadisticasProducto(req, res) {
    try {
      const { id_producto } = req.params;
      const { transacciones } = req.body;
      const estadisticas =
        ProductoEstadisticasService.actualizarEstadisticasProducto(
          id_producto,
          transacciones
        );
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Eliminar estadísticas por ID
  async deleteEstadisticas(req, res) {
    try {
      const { id } = req.params;
      await ProductoEstadisticasService.eliminarEstadisticasPorId(id);
      res.status(200).json({ message: "Estadísticas eliminadas con éxito." });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

export default new ProductoEstadisticasController();

import InventarioService from "../../application/InventarioService.js";

class InventarioController {
  async getInventarioByProductoId(req, res) {
    try {
      const { id_producto } = req.params;
      const inventario = await InventarioService.getInventarioByProductoId(
        id_producto
      );
      res.status(200).json(inventario);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllInventarios(req, res) {
    try {
      const inventarios = await InventarioService.getAllInventarios();
      res.status(200).json(inventarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createInventario(req, res) {
    try {
      const inventario = await InventarioService.addInventario(req.body);
      res.status(201).json(inventario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async ajustarCantidad(req, res) {
    try {
      const { idProducto, cantidad } = req.body;
      const { idUsuario } = req.user; // Middleware de autenticación
      const inventarioActualizado = await InventarioService.ajustarCantidadInventario(idProducto, cantidad, idUsuario);
      res.status(200).json({ mensaje: "Cantidad ajustada con éxito.", inventarioActualizado });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteInventario(req, res) {
    try {
      await InventarioService.deleteInventario(req.params.id_producto);
      res.status(200).json({ message: "Inventario eliminado con éxito" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /* LOGS */
  // Obtener logs del inventario
  async obtenerLogsInventario(req, res) {
    try {
      const logs = await InventarioService.obtenerLogsInventario();
      res.status(200).json(logs);
    } catch (error) {
      console.error("Error al obtener los logs del inventario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Obtener logs para un producto específico
  async obtenerLogsProducto(req, res) {
    try {
      const { id_producto } = req.params;
      const logs = await InventarioService.obtenerLogsPorProducto(id_producto);
      res.status(200).json(logs);
    } catch (error) {
      console.error("Error al obtener los logs del producto:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default new InventarioController();

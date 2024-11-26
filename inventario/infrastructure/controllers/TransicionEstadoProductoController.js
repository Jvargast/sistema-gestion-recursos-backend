import TransicionEstadoProductoService from "../../application/TransicionEstadoProductoService";

class TransicionEstadoProductoController {
  // Obtener estados posibles para un producto
  async obtenerEstadosPosibles(req, res) {
    try {
      const { id_producto } = req.params;
      const estados = await TransicionEstadoProductoService.obtenerEstadosPosibles(id_producto);
      res.status(200).json(estados);
    } catch (error) {
      console.error("Error al obtener los estados posibles:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Crear una nueva transición de estado para un producto
  async crearTransicionEstado(req, res) {
    try {
      const { id_producto } = req.params;
      const { estado_actual, nuevo_estado, motivo } = req.body;

      const resultado = await TransicionEstadoProductoService.crearTransicionEstado(
        id_producto,
        estado_actual,
        nuevo_estado,
        motivo
      );
      res.status(201).json(resultado);
    } catch (error) {
      console.error("Error al crear la transición de estado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default new TransicionEstadoProductoController();

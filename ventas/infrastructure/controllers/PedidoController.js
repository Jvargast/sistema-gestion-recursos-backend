import PedidoService from "../../application/PedidoService.js";

class PedidoController {
  async createPedido(req, res) {
    try {
      const data = req.body;
      data.id_creador = req.user.id;
      const pedido = await PedidoService.createPedido(data);
      res.status(201).json({ message: "Pedido creado exitosamente", pedido });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error al crear pedido: ${error.message}` });
    }
  }

  async confirmarPedido(req, res) {
    try {
      const { id_pedido } = req.params;
      const id_chofer = req.user?.id;

      const resultado = await PedidoService.confirmarPedidoChofer(
        id_pedido,
        id_chofer
      );

      return res.status(200).json({
        message: `Pedido aceptado correctamente.`,
        data: resultado,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }

  async obtenerPedidosAsignados(req, res) {
    try {
      const { id_chofer } = req.params;
      const pedidos = await PedidoService.obtenerPedidosAsignados(
        id_chofer,
        req.query
      );

      return res.status(200).json({
        data: pedidos.data,
        total: pedidos.pagination,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async obtenerPedidosSinAsignar(req, res) {
    try {
      const pedidos = await PedidoService.obtenerPedidosSinAsignar(req.query);
      return res.status(200).json({
        data: pedidos.data,
        total: pedidos.pagination,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async obtenerMisPedidos(req, res) {
    try {
      const id_chofer = req.user.id;
      let fecha = req.query.fecha;

      // 🔹 Validar si la fecha no existe o es inválida
      if (!fecha || isNaN(Date.parse(fecha))) {
        return res
          .status(400)
          .json({ error: "Fecha inválida o no proporcionada." });
      }
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        fecha,
      };
      const pedidos = await PedidoService.obtenerPedidosAsignados(
        id_chofer,
        options
      );
      res.status(200).json({
        data: pedidos.data,
        total: pedidos.pagination,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerHistorialPedidos(req, res) {
    try {
      const id_chofer = req.user?.id;
      if (!id_chofer) {
        return res.status(401).json({ mensaje: "Usuario no autenticado" });
      }

      const { fecha, page = 1, limit = 10 } = req.query;

      if (!fecha) {
        return res
          .status(400)
          .json({ mensaje: "Debe proporcionar una fecha válida" });
      }

      const historialPedidos = await PedidoService.obtenerHistorialPedidos(
        id_chofer,
        fecha,
        { page: parseInt(page, 10), limit: parseInt(limit, 10) }
      );

      res.json(historialPedidos);
    } catch (error) {
      console.error("Error al obtener historial de pedidos:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  }

  async obtenerPedidosConfirmados(req, res) {
    try {
      const { id_chofer } = req.params;
      const pedidos = await PedidoService.getPedidosConfirmadosPorChofer(
        id_chofer
      );
      res.status(200).json(pedidos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPedidoById(req, res) {
    try {
      const { id_pedido } = req.params;
      const pedido = await PedidoService.getPedidoById(id_pedido);
      if (!pedido)
        return res.status(404).json({ message: "Pedido no encontrado" });

      res.status(200).json(pedido);
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error al obtener pedido: ${error.message}` });
    }
  }

  async getAllPedidos(req, res) {
    try {
      const filters = req.query;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      };
      delete filters.page;
      delete filters.limit;

      const pedidos = await PedidoService.getPedidos(filters, options);

      res.status(200).json({
        data: pedidos.data,
        total: pedidos.pagination,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async actualizarEstado(req, res) {
    try {
      const { id_pedido } = req.params;
      const { nuevoEstado } = req.body;

      if (!nuevoEstado)
        return res.status(400).json({ message: "El estado es requerido" });

      const pedidoActualizado = await PedidoService.updateEstadoPedido(
        id_pedido,
        nuevoEstado
      );
      if (!pedidoActualizado)
        return res.status(404).json({ message: "Pedido no encontrado" });

      res.status(200).json({
        message: "Estado del pedido actualizado",
        pedido: pedidoActualizado,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error al actualizar estado: ${error.message}` });
    }
  }

  async asignarPedido(req, res) {
    try {
      const { id_pedido } = req.params;
      const { id_chofer } = req.body;

      if (!id_chofer)
        return res
          .status(400)
          .json({ message: "El ID del chofer es requerido" });

      const pedidoAsignado = await PedidoService.asignarPedido(
        id_pedido,
        id_chofer
      );
      if (!pedidoAsignado)
        return res.status(404).json({ message: "Pedido no encontrado" });

      res
        .status(200)
        .json({ message: "Pedido asignado al chofer", pedido: pedidoAsignado });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error al asignar pedido: ${error.message}` });
    }
  }

  async desasignarPedido(req, res) {
    try {
      const { id_pedido } = req.params;

      const pedidoDesasignado = await PedidoService.desasignarPedidoAChofer(
        id_pedido
      );
      if (!pedidoDesasignado)
        return res.status(404).json({ message: "Pedido no encontrado" });

      res.status(200).json({
        message: "Pedido desasignado del chofer",
        pedido: pedidoDesasignado,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error al asignar pedido: ${error.message}` });
    }
  }

  async eliminarPedido(req, res) {
    try {
      const { id_pedido } = req.params;
      const deleted = await PedidoService.deletePedido(id_pedido);

      if (!deleted)
        return res.status(404).json({ message: "Pedido no encontrado" });

      res.status(200).json({ message: "Pedido eliminado exitosamente" });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error al eliminar pedido: ${error.message}` });
    }
  }
}

export default new PedidoController();

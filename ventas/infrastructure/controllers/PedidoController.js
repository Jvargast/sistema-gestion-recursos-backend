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
      const { estado } = req.body;
      const id_chofer = req.user?.id;

      if (!id_chofer || !["Aceptado", "Rechazado"].includes(estado)) {
        return res.status(400).json({ error: "Datos inválidos" });
      }
      id_chofer;

      const resultado = await PedidoService.confirmarPedido(
        id_pedido,
        id_chofer,
        estado
      );

      return res
        .status(200)
        .json({
          message: `Pedido ${estado.toLowerCase()} correctamente.`,
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
      const pedidos = await PedidoService.obtenerPedidosAsignados(
        id_chofer,
        req.query
      );
      res.status(200).json({
        data: pedidos.data,
        total: pedidos.pagination,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerPedidosConfirmados(req, res) {
    try {
      const id_chofer = req.user.id;
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

      const pedidoAsignado = await PedidoService.asignarPedidoAChofer(
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

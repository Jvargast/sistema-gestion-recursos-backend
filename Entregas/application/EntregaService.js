import DetalleTransaccionRepository from "../../ventas/infrastructure/repositories/DetalleTransaccionRepository.js";
import EntregaRepository from "../infrastructure/repositories/EntregaRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";

class EntregaService {
  async createEntrega(detalles, rut, fechaHoraEntrega) {
    if (!detalles || !rut || !fechaHoraEntrega) {
      throw new Error("Faltan datos para continuar con la entrega");
    }
    const entregas = [];
    for (const id_detalle_transaccion of detalles) {
      const detalle = await DetalleTransaccionRepository.findById(
        id_detalle_transaccion
      );
      if (!detalle) {
        throw new Error(
          `DetalleTransaccion con id ${id_detalle_transaccion} no encontrado`
        );
      }
      const entrega = await EntregaRepository.create({
        id_detalle_transaccion,
        id_usuario_chofer: rut,
        fechaHoraEntrega,
        estadoEntrega: "Entregado",
      });
      // Actualizar el estado del detale
      await DetalleTransaccionRepository.update(id_detalle_transaccion, {
        estado_producto_transaccion: 6,
      });
      entregas.push(entrega);
    }

    return { message: "Entregas registradas", entregas };
  }

  async registrarVentaAdicional({ id_camion, id_producto, cantidad }) {
    if (!id_camion || !id_producto || !cantidad) {
      throw new Error("Faltan datos para registrar la venta adicional");
    }

    const productoEnCamion = await InventarioCamionRepository.findOne({
      where: { id_camion, id_producto, estado: "En Camión - Disponible" },
    });

    if (!productoEnCamion || productoEnCamion.cantidad < cantidad) {
      throw new Error("Stock insuficiente en el inventario del camión");
    }

    // Actualizar el inventario del camión
    const nuevaCantidad = productoEnCamion.cantidad - cantidad;
    await InventarioCamionRepository.update(productoEnCamion.id, {
      cantidad: nuevaCantidad,
      estado: nuevaCantidad === 0 ? "Vendido" : "En Camión - Disponible",
    });

    return { message: "Venta adicional registrada" };
  }

  async getEntregaById(id) {
    const entrega = await EntregaRepository.findById(id);
    if (!entrega) {
      throw new Error("Entrega not found");
    }
    return entrega;
  }

  async getAllEntregas() {
    return await EntregaRepository.findAll();
  }

  async updateEntrega(id, data) {
    return await EntregaRepository.update(id, data);
  }

  async deleteEntrega(id) {
    return await EntregaRepository.delete(id);
  }
}

export default new EntregaService();

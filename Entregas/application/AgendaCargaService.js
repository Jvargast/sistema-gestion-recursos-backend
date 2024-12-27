import InventarioService from "../../inventario/application/InventarioService.js";
import EstadoDetalleTransaccionService from "../../ventas/application/EstadoDetalleTransaccionService.js";
import DetalleTransaccionRepository from "../../ventas/infrastructure/repositories/DetalleTransaccionRepository.js";
import AgendaCargaRepository from "../infrastructure/repositories/AgendaCargaRepository.js";
import InventarioCamionService from "./InventarioCamionService.js";

class AgendaCargaService {
  async createAgenda(fecha_hora, rut, detalles, productosAdicionales, id_camion) {
    // Validar datos
    if (!fecha_hora) {
        fecha_hora = new Date(); // Genera la fecha y hora actual si no se proporciona
      }
    if (!rut) {
      throw new Error("Faltan datos para agregar agenda");
    }
    const agenda = await AgendaCargaRepository.create({
      fechaHora:fecha_hora,
      id_usuario_chofer: rut,
      id_camion
    });
    // Nuevo estado en Tránsito - Reservado
    const nuevo_estado = await EstadoDetalleTransaccionService.findByNombre(
      "En tránsito - Reservado"
    );
    // Asignar detalles a la agenda
    if (detalles && detalles.length > 0) {
      await Promise.all(
        detalles.map(async (id_detalle_transaccion) => {
          const detalle = await DetalleTransaccionRepository.findById(
            id_detalle_transaccion
          );
          if (!detalle) {
            throw new Error(
              `Detalle Transaccion con id ${id_detalle_transaccion} no encontrado`
            );
          }
          await InventarioService.decrementarStock(
            detalle.id_producto,
            detalle.cantidad
          );
          await DetalleTransaccionRepository.update(id_detalle_transaccion, {
            id_agenda_carga: agenda.id,
            estado_producto_transaccion:
              nuevo_estado.dataValues.id_estado_detalle_transaccion,
          });
          // Agregar al inventario del camión
        await InventarioCamionService.addProductToCamion({
            id_camion,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
          }, true);
        })
      );
    }

    if (productosAdicionales && productosAdicionales.length > 0) {
      // Mover productos adicionales al inventario
      for (const producto of productosAdicionales) {
        const inventario = await InventarioService.getInventarioByProductoId(
          producto.id_producto
        );
        if (!inventario || inventario.cantidad < producto.cantidad) {
          throw new Error(
            `Insufficient stock for product ID ${producto.id_producto}`
          );
        }
        // Falta metodo para disminuir inventario según producto y cantidad
        await InventarioService.decrementarStock(
          producto.id_producto,
          producto.cantidad
        );

        // Falta repositorio camion
        await InventarioCamionService.addProductToCamion({
          id_camion,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad,
        });
      }
    }

    // Crear la agenda
    return agenda;
  }

  async getAgendaById(id) {
    const agenda = await AgendaCargaRepository.findById(id);
    if (!agenda) {
      throw new Error("Agenda not found");
    }
    return agenda;
  }

  async getAllAgendas() {
    return await AgendaCargaRepository.findAll();
  }

  async updateAgenda(id, data) {
    return await AgendaCargaRepository.update(id, data);
  }

  async deleteAgenda(id) {
    return await AgendaCargaRepository.delete(id);
  }
}

export default new AgendaCargaService();

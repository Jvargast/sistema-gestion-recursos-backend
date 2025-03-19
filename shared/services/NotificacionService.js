import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import { io } from "../../index.js";
import NotificacionRepository from "../repositories/NotificacionRepository.js";

class NotificacionService {
  /**
   * 📌 Inicializa el servidor de WebSockets
   */
  /**
   * 📌 Enviar una notificación genérica a un usuario
   */
  static async enviarNotificacion({ id_usuario, mensaje, tipo }) {
    try {
      // Verificar que el usuario existe
      const usuario = await UsuariosRepository.findByRut(id_usuario);
      if (!usuario) throw new Error("Usuario no encontrado.");

      // Guardar la notificación en la base de datos
      const nuevaNotificacion = await NotificacionRepository.create({
        id_usuario,
        mensaje,
        tipo,
        leida: false,
        fecha: new Date(),
      });

      console.log(
        "Emitiendo notificación a la sala:",
        `usuario_${id_usuario}`,
        "con datos:",
        {
          id: nuevaNotificacion.id_notificacion,
          mensaje,
          tipo,
          fecha: nuevaNotificacion.fecha,
        }
      );

      io.to(`usuario_${id_usuario}`).emit("nueva_notificacion", {
        id: nuevaNotificacion.id_notificacion,
        mensaje,
        tipo,
        fecha: nuevaNotificacion.fecha,
      });
    } catch (error) {
      console.error("❌ Error al enviar notificación:", error);
    }
  }

  /**
   * 📌 Enviar notificación de pedido asignado
   */
  static async enviarNotificacionPedido(id_chofer, id_pedido) {
    try {
      const mensaje = `🚚 Nuevo pedido asignado: ID ${id_pedido}`;
      await this.enviarNotificacion({
        id_usuario: id_chofer,
        mensaje,
        tipo: "pedido_asignado",
      });
    } catch (error) {
      console.error("❌ Error al enviar notificación de pedido:", error);
    }
  }

  /**
   * 📌 Obtener todas las notificaciones de un usuario
   */
  static async obtenerNotificaciones(id_usuario) {
    try {
      return await NotificacionRepository.findByUsuario(id_usuario);
    } catch (error) {
      console.error("❌ Error al obtener notificaciones:", error);
      return [];
    }
  }

  /**
   * 📌 Marcar notificación como leída
   */
  static async marcarComoLeida(id_notificacion) {
    try {
      return await NotificacionRepository.update(id_notificacion, {
        leida: true,
      });
    } catch (error) {
      console.error("❌ Error al marcar notificación como leída:", error);
      throw error;
    }
  }

  /**
   * 📌 Enviar notificación masiva a múltiples usuarios
   */
  static async enviarNotificacionMasiva({ usuarios, mensaje, tipo }) {
    try {
      if (!usuarios || usuarios.length === 0) return;

      // Guardar todas las notificaciones en la base de datos
      const notificaciones = usuarios.map((id_usuario) => ({
        id_usuario,
        mensaje,
        tipo,
        leida: false,
        fecha: new Date(),
      }));

      await NotificacionRepository.bulkCreate(notificaciones);

      // Enviar notificaciones en tiempo real

      usuarios.forEach((id_usuario) => {
        io.to(`usuario_${id_usuario}`).emit("nueva_notificacion", {
          mensaje,
          tipo,
          fecha: new Date(),
        });
      });
    } catch (error) {
      console.error("❌ Error al enviar notificaciones masivas:", error);
    }
  }
}

export default NotificacionService;

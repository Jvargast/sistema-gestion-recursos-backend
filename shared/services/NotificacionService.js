import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import { io } from "../../index.js";
import NotificacionRepository from "../repositories/NotificacionRepository.js";

class NotificacionService {
  static async enviarNotificacion({ id_usuario, mensaje, tipo, datos_adicionales }) {
    try {
      const usuario = await UsuariosRepository.findByRutBasic(id_usuario);
      if (!usuario) throw new Error("Usuario no encontrado.");

      const nuevaNotificacion = await NotificacionRepository.create({
        id_usuario,
        mensaje,
        tipo,
        leida: false,
        fecha: new Date(),
        datos_adicionales
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
          datos_adicionales
        }
      );

      io.to(`usuario_${id_usuario}`).emit("nueva_notificacion", {
        id: nuevaNotificacion.id_notificacion,
        mensaje,
        tipo,
        fecha: nuevaNotificacion.fecha,
        datos_adicionales
      });
      return nuevaNotificacion;
    } catch (error) {
      console.error("❌ Error al enviar notificación:", error);
      throw new Error(`No se pudo enviar la notificación: ${error.message}`);
    }
  }

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


  static async obtenerNotificaciones(id_usuario) {
    try {
      return await NotificacionRepository.findByUsuario(id_usuario);
    } catch (error) {
      console.error("❌ Error al obtener notificaciones:", error);
      return [];
    }
  }


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


  static async enviarNotificacionMasiva({ usuarios, mensaje, tipo }) {
    try {
      if (!usuarios || usuarios.length === 0) return;

      const notificaciones = usuarios.map((id_usuario) => ({
        id_usuario,
        mensaje,
        tipo,
        leida: false,
        fecha: new Date(),
      }));

      await NotificacionRepository.bulkCreate(notificaciones);


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

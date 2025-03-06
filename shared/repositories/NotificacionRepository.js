import Notificacion from "../domain/Notificacion.js";


class NotificacionRepository {
  /**
   * 📌 Crear una nueva notificación
   */
  async create(data) {
    return await Notificacion.create(data);
  }

  /**
   * 📌 Buscar notificación por ID
   */
  async findById(id) {
    return await Notificacion.findByPk(id);
  }

  /**
   * 📌 Buscar todas las notificaciones de un usuario
   */
  async findByUsuario(id_usuario) {
    return await Notificacion.findAll({
      where: { id_usuario },
      order: [["fecha", "DESC"]],
    });
  }

  /**
   * 📌 Marcar notificación como leída
   */
  async update(id, data) {
    return await Notificacion.update(data, { where: { id_notificacion: id } });
  }

  /**
   * 📌 Eliminar notificación
   */
  async delete(id) {
    return await Notificacion.destroy({ where: { id_notificacion: id } });
  }
}

export default new NotificacionRepository();

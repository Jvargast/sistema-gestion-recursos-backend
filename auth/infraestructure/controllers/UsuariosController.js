import UsuariosService from "../../application/UsuariosService.js";

class UsuarioController {
  /**
   * Crear un nuevo usuario.
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async create(req, res) {
    const { rut, nombre, apellido, email, password, rolId } = req.body;

    try {
      const usuario = await UsuariosService.createUsuario({
        rut,
        nombre,
        apellido,
        email,
        password,
        rolId,
      });
      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener todos los usuarios.
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async findAll(req, res) {
    try {
      const usuarios = await UsuariosService.getAllUsuarios();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener un usuario por su RUT.
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async findByRut(req, res) {
    const { rut } = req.params;

    try {
      const usuario = await UsuariosService.getUsuarioByRut(rut);
      if (!usuario) {
        res.status(404).json({ error: "Usuario no encontrado" });
      } else {
        res.status(200).json(usuario);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Actualizar un usuario por su RUT.
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async update(req, res) {
    const { rut } = req.params;
    const data = req.body;

    try {
      const updatedUsuario = await UsuariosService.updateUsuario(rut, data);
      res.status(200).json(updatedUsuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Desactivar un usuario (marcar como inactivo).
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async deactivate(req, res) {
    const { rut } = req.params;

    try {
      const result = await UsuariosService.deactivateUsuario(rut);
      res
        .status(200)
        .json({ message: "Usuario desactivado exitosamente", result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Cambiar contraseña
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async changePassword(req, res) {
    try {
      const { rut } = req.user;
      const { currentPassword, newPassword } = req.body;

      console.log(rut)
      // Validar que se reciban las contraseñas
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "Se requieren ambas contraseñas (actual y nueva)." });
      }

      await UsuariosService.changePassword(rut, currentPassword, newPassword);

      res.status(200).json({ message: "Contraseña actualizada con éxito." });
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  }
}

export default new UsuarioController();

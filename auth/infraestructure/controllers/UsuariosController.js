import UsuariosService from "../../application/UsuariosService.js";

class UsuarioController {
  /**
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async create(req, res) {
    const {
      rut,
      nombre,
      apellido,
      email,
      password,
      rolId,
      id_empresa,
      id_sucursal,
    } = req.body;

    try {
      const usuario = await UsuariosService.createUsuario({
        rut,
        nombre,
        apellido,
        email,
        password,
        rolId,
        id_empresa,
        id_sucursal,
      });
      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createNewUser(req, res) {
    const {
      rut,
      nombre,
      apellido,
      email,
      password,
      rolId,
      id_empresa,
      id_sucursal,
    } = req.body;
    try {
      const usuario = await UsuariosService.createNewUsuario({
        rut,
        nombre,
        apellido,
        email,
        password,
        rolId,
        id_empresa,
        id_sucursal,
      });

      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async getAllUsers(req, res) {
    try {
      const filters = req.query;
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
      };
      delete filters.limit;
      delete filters.offset;
      const usuarios = await UsuariosService.getAllUsuarios(filters, options);
      res.status(200).json({ data: usuarios.data, total: usuarios.pagination });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllChoferes(req, res) {
    try {
      const { id_sucursal } = req.query;
      const filters = {};
      if (id_sucursal !== undefined && id_sucursal !== "") {
        filters.id_sucursal = Number(id_sucursal);
      }
      const choferes = await UsuariosService.getAllChoferes(filters);
      res.status(200).json(choferes);
    } catch (error) {
      console.error("Error al obtener choferes:", error.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async getAllVendedores(req, res) {
    try {
      const vendedores = await UsuariosService.getAllVendedores();
      res.status(200).json(vendedores);
    } catch (error) {
      console.error("Error al obtener choferes:", error.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
  async getAllUsuariosConCaja(req, res) {
    try {
      const usuariosConCaja = await UsuariosService.getAllUsuariosConCaja();
      res.status(200).json(usuariosConCaja);
    } catch (error) {
      console.error("Error al obtener usuarios con caja:", error.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
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
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const rut = req.user?.id;

      if (!rut) {
        return res.status(400).json({ message: "Usuario no autenticado." });
      }

      const result = await UsuariosService.changePassword(
        rut,
        currentPassword,
        newPassword,
        confirmPassword
      );

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error.message);
      return res.status(400).json({ message: error.message });
    }
  }

  async updateOwnProfile(req, res) {
    try {
      const rut = req.user?.id;
      const updateData = req.body;

      const updatedUser = await UsuariosService.updateUserById(rut, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      return res.status(200).json({
        message: updatedUser.message,
        data: updatedUser.usuario,
      });
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      const status = error.message === "El usuario no existe." ? 404 : 400;
      return res.status(status).json({ message: error.message });
    }
  }
  async getOwnProfile(req, res) {
    try {
      const rut = req.user?.id;
      if (!rut) {
        return res.status(400).json({ message: "Usuario no autenticado." });
      }
      const usuario = await UsuariosService.getUsuarioByRut(rut);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      return res
        .status(200)
        .json({ message: "Perfil obtenido con éxito.", data: usuario });
    } catch (error) {
      console.error("Error al obtener el perfil:", error.message);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }

  async updateUserPassword(req, res) {
    const { rut } = req.params;
    const { newPassword } = req.body;

    try {
      if (!newPassword || newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "La contraseña debe tener al menos 8 caracteres." });
      }

      const updated = await UsuariosService.updatePassword(rut, newPassword);

      if (updated) {
        return res
          .status(200)
          .json({ message: "Contraseña actualizada correctamente." });
      } else {
        return res
          .status(404)
          .json({ error: "Usuario no encontrado o no activo." });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(400)
        .json({ error: error.message || "Error al actualizar la contraseña." });
    }
  }
}

export default new UsuarioController();

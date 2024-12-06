import AuthService from "../../application/AuthService.js";

class AuthController {
  /**
   * Iniciar sesión: manejar solicitud HTTP para autenticación.
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async login(req, res) {
    const { rut, password } = req.body;

    try {
      const {token, usuario} = await AuthService.login(rut, password);

      // Configurar cookie con el token JWT
      res.cookie("authToken", token, {
        httpOnly: true, // Asegura que la cookie no sea accesible desde el frontend (prevención de XSS)
        secure: process.env.NODE_ENV === 'production' ? true : false, // Solo enviar la cookie en HTTPS en producción
        sameSite:"none",//sameSite: "strict", // Prevenir ataques CSRF
        maxAge: 60 * 60 * 1000, // Expira en 1 hora
      });

      res.status(200).json({ success: true, usuario });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Cerrar sesión: eliminar la cookie.
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async logout(req, res) {
    try {
      res.clearCookie("authToken");
      res.status(200).json({ message: "Cierre de sesión exitoso" });
    } catch {
      res.status(401).json({ error: error.message });
    }
  }

  async getAuthenticatedUser(req, res) {
    try {
      // El middleware ya agregó el usuario autenticado a `req.user`
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      res.status(200).json({
        message: "Usuario autenticado con éxito",
        user,
      });
    } catch (error) {
      console.error("Error al obtener el usuario autenticado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default new AuthController();

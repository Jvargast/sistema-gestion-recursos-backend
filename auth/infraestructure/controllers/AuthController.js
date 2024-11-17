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
      const token = await AuthService.login(rut, password);

      // Configurar cookie con el token JWT
      res.cookie('authToken', token, {
        httpOnly: true, // Asegura que la cookie no sea accesible desde el frontend (prevención de XSS)
        //secure: process.env.NODE_ENV === 'production', // Solo enviar la cookie en HTTPS en producción
        sameSite: 'strict', // Prevenir ataques CSRF
        //maxAge: 60 * 60 * 1000, // Expira en 1 hora
      });

      res.status(200).json({ message: 'Inicio de sesión exitoso' });
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
        res.clearCookie('authToken');
        res.status(200).json({ message: 'Cierre de sesión exitoso' });
    } catch {
        res.status(401).json({ error: error.message });
    }
    
  }
}

export default new AuthController();
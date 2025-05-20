import { getCookieSettings } from "../../../shared/utils/cookieUtil.js";
import AuditLogsService from "../../application/AuditLogsService.js";
import AuthService from "../../application/AuthService.js";
import jwt from "jsonwebtoken";
class AuthController {
  /**
   * Iniciar sesión: manejar solicitud HTTP para autenticación.
   * @param {Request} req - Solicitud HTTP.
   * @param {Response} res - Respuesta HTTP.
   */
  async login(req, res) {
    const { rut, password } = req.body;
    const ip = req.ip;

    try {
      const { token, usuario, refreshToken } = await AuthService.login(
        rut,
        password
      );

      //Audiar inicio de sesión
      await AuditLogsService.logAction(
        rut,
        "Inicio de sesión",
        "Autenticación",
        ip
      );
      // Configurar cookie con el token JWT
      res.cookie("authToken", token, {
        ...getCookieSettings(),
        maxAge: 1 * 60 * 60 * 1000, // Expira en 1 hora
      });

      res.cookie("refreshToken", refreshToken, {
        ...getCookieSettings(),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
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
      const ip = req.ip;

      const { refreshToken } = req.cookies;
      if (refreshToken) {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        await AuthService.removeRefreshToken(decoded.rut);
      }
      await AuditLogsService.logAction(
        req?.user.id,
        "Cerrar Sesión",
        "Autenticación",
        ip
      );
      res.clearCookie("authToken", getCookieSettings());
      res.clearCookie("refreshToken", getCookieSettings());

      res.status(200).json({ message: "Cierre de sesión exitoso" });
    } catch (error) {
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

      const { id, nombre, apellido, email, rol, permisos, id_sucursal } = user;

      res.status(200).json({
        message: "Usuario autenticado con éxito",
        usuario: { id, nombre, apellido, email, id_sucursal },
        rol,
        permisos,
      });
    } catch (error) {
      console.error("Error al obtener el usuario autenticado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async refreshToken(req, res) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh Token no encontrado" });
    }

    try {
      // Verificar el Refresh Token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

      // Opcional: verifica si el Refresh Token aún es válido en la base de datos
      const isTokenValid = await AuthService.isValidRefreshToken(
        refreshToken,
        decoded.rut
      );
      if (!isTokenValid) {
        return res.status(401).json({ error: "Refresh token inválido" });
      }
      // Generar un nuevo Access Token
      const newAccessToken = jwt.sign(
        { rut: decoded.rut, rolId: decoded.rolId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Enviar el nuevo Access Token en una cookie
      res.cookie("authToken", newAccessToken, {
        ...getCookieSettings(),
        maxAge: 1 * 60 * 60 * 1000,
      });

      res.status(200).json({ success: true, message: "Token renovado" });
    } catch (error) {
      console.error("Error en Refresh Token:", error);
      res.status(401).json({ error: "Refresh Token inválido o expirado" });
    }
  }
}

export default new AuthController();

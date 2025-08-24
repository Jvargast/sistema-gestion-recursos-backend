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

      await AuditLogsService.logAction(
        rut,
        "Inicio de sesión",
        "Autenticación",
        ip
      );

      const plain = usuario.get({ plain: true });
      const permisos = (plain?.rol?.rolesPermisos || [])
        .map((rp) => rp?.permiso?.nombre)
        .filter(Boolean);
      delete plain.password;
      if (plain.rol) delete plain.rol.rolesPermisos;
      res.cookie("authToken", token, {
        ...getCookieSettings(),
        maxAge: 1 * 60 * 60 * 1000, // Expira en 1 hora
      });

      res.cookie("refreshToken", refreshToken, {
        ...getCookieSettings(),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      res.status(200).json({
        success: true,
        usuario: plain,
        rol: plain.rol ? { id: plain.rol.id, nombre: plain.rol.nombre } : null,
        permisos,
      });
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
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const {
        id,
        nombre,
        apellido,
        email,
        rol,
        permisos,
        id_sucursal,
        nombre_sucursal,
      } = user;

      res.status(200).json({
        message: "Usuario autenticado con éxito",
        usuario: { id, nombre, apellido, email, id_sucursal, nombre_sucursal },
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
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

      const isTokenValid = await AuthService.isValidRefreshToken(
        refreshToken,
        decoded.rut
      );
      if (!isTokenValid) {
        return res.status(401).json({ error: "Refresh token inválido" });
      }
      const newAccessToken = jwt.sign(
        { rut: decoded.rut, rolId: decoded.rolId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

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

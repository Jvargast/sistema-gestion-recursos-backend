import jwt from "jsonwebtoken";
import AuthService from "../../auth/application/AuthService.js"; // Servicio para manejar la lógica relacionada con autenticación
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import { getCookieSettings } from "../utils/cookieUtil.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;
    if (!token) {
      return res.status(401).json({ error: "Token no encontrado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res.clearCookie("authToken");
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(401).json({ error: "Token inválido" });
    }

    const user = await AuthService.getUserFromToken(decoded);

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const now = new Date();
    await UsuariosRepository.updateLastLogin(user.rut, now);

    const currentTime = Math.floor(Date.now() / 1000);
    const timeToExpire = decoded.exp - currentTime;

    if (timeToExpire < 60 * 15) {
      const newToken = jwt.sign(
        { rut: user.rut, rolId: user.rolId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("authToken", newToken, {
        ...getCookieSettings(),
        maxAge: 60 * 60 * 1000,
      });
    }
    req.user = {
      id: user.rut,
      rut: user.rut,
      nombre: user.nombre,
      apellido: user.apellido,
      id_sucursal: user.id_sucursal,
      nombre_sucursal: user.nombre_sucursal,
      email: user.email,
      rol: user.rol,
      rolId: user.rolId,
      activo: user.activo,
      permisos: user.permisos,
    };

    next();
  } catch (error) {
    console.error("Error en la autenticación:", error);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default authenticate;

import jwt from "jsonwebtoken";
import AuthService from "../../auth/application/AuthService.js"; // Servicio para manejar la lógica relacionada con autenticación
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import RolRepository from "../../auth/infraestructure/repositories/RolRepository.js";

const authenticate = async (req, res, next) => {
  try {
    // Obtener el token desde la cookie
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: "Token no encontrado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(401).json({ error: "Token inválido" });
    }

    // Obtener el usuario relacionado al token
    const user = await AuthService.getUserFromToken(decoded);

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    
    const now = new Date();
    await UsuariosRepository.updateLastLogin(user.rut, now);

    // Agregar el usuario al objeto de la solicitud para uso posterior
    req.user = {
      id: user.rut,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      permisos: user.permisos, // Asegúrate de que este campo esté presente
    };

    next();
  } catch (error) {
    console.error("Error en la autenticación:", error);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default authenticate;

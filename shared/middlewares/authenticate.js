import jwt from "jsonwebtoken";
import AuthService from "../../auth/application/AuthService.js"; // Servicio para manejar la lógica relacionada con autenticación

const authenticate = async (req, res, next) => {
  try {
    // Obtener el token desde la cookie
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: "Token no encontrado" });
    }

    // Decodificar y validar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el usuario relacionado al token
    const user = await AuthService.getUserFromToken(decoded);

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Agregar el usuario al objeto de la solicitud para uso posterior
    req.user = user;

    next();
  } catch (error) {
    console.error("Error en la autenticación:", error);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default authenticate;

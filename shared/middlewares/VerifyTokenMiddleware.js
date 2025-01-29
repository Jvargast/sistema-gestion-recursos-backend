import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.authToken; // Obtener el token de la cookie
    if (!token) {
      return res.status(401).json({ error: "Token no encontrado" });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Calcular el tiempo restante para la expiración
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    const timeToExpire = decoded.exp - currentTime;
    // Renovar el token si faltan menos de 15 minutos para expirar
    if (timeToExpire < 60 * 15) {
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email }, // Datos del payload
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Nueva expiración (7 días)
      );
      // Enviar el nuevo token en la cookie
      res.cookie("authToken", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      });
    }

    // Añadir los datos del usuario decodificado a la solicitud
    req.user = decoded;

    next(); // Continuar al siguiente middleware o controlador
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default verifyToken;

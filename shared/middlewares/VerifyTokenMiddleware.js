import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.authToken; // Obtener el token de la cookie
    if (!token) {
      return res.status(401).json({ error: 'Token no encontrado' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Añadir los datos del usuario decodificado a la solicitud
    req.user = decoded;

    next(); // Continuar al siguiente middleware o controlador
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export default verifyToken;
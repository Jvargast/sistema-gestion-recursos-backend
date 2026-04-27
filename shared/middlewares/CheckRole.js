export function checkRoles(requiredRoles) {
  return (req, res, next) => {
    try {
      const rol = req.user?.rol;

      if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      if (!rol) {
        return res.status(403).json({ error: "Rol no definido en el usuario" });
      }

      if (!requiredRoles.includes(rol)) {
        return res.status(403).json({
          error: `Acceso denegado. Se requiere uno de los roles: ${requiredRoles.join(", ")}`,
        });
      }

      return next();
    } catch (error) {
      console.error("Error al verificar roles:", error);
      return res.status(500).json({ error: "Error interno al verificar roles" });
    }
  };
}

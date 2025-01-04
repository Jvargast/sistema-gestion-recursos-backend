export function checkRoles(requiredRoles) {
    return (req, res, next) => {
      try {
        // Asegúrate de que `req.user` tiene un rol definido
        const rol = req.user?.rol?.dataValues?.nombre;
  
        if (!rol) {
          return res.status(403).json({ error: "Rol no definido en el usuario" });
        }
  
        // Compara el rol del usuario con los roles requeridos
        if (!requiredRoles.includes(rol)) {
          return res.status(403).json({
            error: `Acceso denegado. Se requiere uno de los roles: ${requiredRoles.join(", ")}`,
          });
        }
  
        next(); // Permitir acceso si el rol es válido
      } catch (error) {
        console.error("Error al verificar roles:", error);
        res.status(500).json({ error: "Error interno al verificar roles" });
      }
    };
  }
  

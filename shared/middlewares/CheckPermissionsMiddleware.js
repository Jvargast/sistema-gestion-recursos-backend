export default function checkPermissions(requiredPermission) {
  return (req, res, next) => {
    try {
      const usuario = req.user;

      if (!usuario) {
        return res.status(401).json({ error: "No autenticado" });
      }

      if (usuario.activo === false) {
        return res
          .status(403)
          .json({ error: "Usuario no autorizado o inactivo" });
      }

      const permisos = usuario.permisos || [];

      if (!permisos.includes(requiredPermission)) {
        return res
          .status(403)
          .json({ error: `Permiso '${requiredPermission}' requerido` });
      }

      return next();
    } catch (error) {
      console.error("Error al verificar permisos:", error);
      return res.status(500).json({ error: "Error al verificar permisos" });
    }
  };
}

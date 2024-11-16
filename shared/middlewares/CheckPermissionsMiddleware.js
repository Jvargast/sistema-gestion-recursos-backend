import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";

const checkPermissions = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const {rut} = req; // esto debe venir de la cookie
            const usuario = await UsuariosRepository.findByRut(rut);
            
            if(!usuario || !usuario.activo) {
                return res.status(403).json({error: "Usuario no autorizado o inactivo"});
            }
            
            // Verificar si el rol del usuario tiene el permiso requerido
            const permisos = usuario.rol.rolesPermisos.map((rolePermiso) => rolePermiso.permiso.nombre);

            // Verificar si el permiso requerido está en la lista de permisos del rol
            if (!permisos.includes(requiredPermission)) {
                return res.status(403).json({ error: `Permiso '${requiredPermission}' requerido` });
            }

            next(); // Permitir acceso al siguiente middleware o controlador

        } catch (error) {
            console.error('Error al verificar permisos:', error);
            res.status(500).json({ error: 'Error al verificar permisos' });
          }
    }
}

export default checkPermissions;
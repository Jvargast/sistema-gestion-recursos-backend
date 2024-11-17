import PermisosRepository from "../../auth/infraestructure/repositories/PermisosRepository.js";
import RolRepository from "../../auth/infraestructure/repositories/RolRepository.js";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";

export default function checkPermissions(requiredPermission) {
    return async (req, res, next) => {
        try {
            console.log(req.user.rut);
            const rut = req.user.rut; // esto debe venir de la cookie
            const usuario = await UsuariosRepository.findByRut(rut);
            const rol = await RolRepository.findById(usuario.rolId);
            
            
            if(!usuario || !usuario.activo) {
                return res.status(403).json({error: "Usuario no autorizado o inactivo"});
            }
            
            // Verificar si el rol del usuario tiene el permiso requerido
            const permisos = rol.rolesPermisos.map((rolePermiso) => rolePermiso.permiso.nombre);
            //const permisos = usuario.rol.rolesPermisos.map((rolePermiso) => rolePermiso.permiso.nombre);

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

/* export default checkPermissions; */
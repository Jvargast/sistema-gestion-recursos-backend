import RolRepository from "../../auth/infraestructure/repositories/RolRepository.js";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";

export default function checkPermissions(requiredPermission) {
    return async (req, res, next) => {
        try {
            const rut = req.user.id; 
            const usuario = await UsuariosRepository.findByRut(rut);
            const rol = await RolRepository.findById(usuario.rolId);
            
            
            if(!usuario || !usuario.activo) {
                return res.status(403).json({error: "Usuario no autorizado o inactivo"});
            }
            
            const permisos = rol.rolesPermisos.map((rolePermiso) => rolePermiso.permiso.nombre);

            if (!permisos.includes(requiredPermission)) {
                return res.status(403).json({ error: `Permiso '${requiredPermission}' requerido` });
            }

            next(); 

        } catch (error) {
            console.error('Error al verificar permisos:', error);
            res.status(500).json({ error: 'Error al verificar permisos' });
          }
    }
}

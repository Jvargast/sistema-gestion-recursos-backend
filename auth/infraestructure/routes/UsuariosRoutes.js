import { Router } from 'express';
import UsuariosController from '../controllers/UsuariosController.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';
import authenticate from '../../../shared/middlewares/authenticate.js';

const router = Router();



// Ruta para crear usuario, protegida con el middleware para verificar el permiso 'crear_usuario'
router.post('/', authenticate, checkPermissions('crear_usuarios'), UsuariosController.create);
// Ruta para crear usuario sin servicio de correo.
router.post('/crear', authenticate, checkPermissions('crear_usuarios'), UsuariosController.createNewUser);
// Obtener todos los usuarios del sistema
router.get('/', authenticate, checkPermissions('ver_usuarios'), UsuariosController.getAllUsers);
// Obtener todos los usuarios rol chofer
router.get('/choferes', authenticate, checkPermissions('ver_usuarios'), UsuariosController.getAllChoferes);
// Obtener mi perfil propio
router.get('/mi-perfil', authenticate, UsuariosController.getOwnProfile);
// Obtener un usuario por RUT
router.get('/:rut', authenticate, checkPermissions('ver_usuario'), UsuariosController.findByRut);
// Actualizar perfil propio
router.put('/mi-perfil', authenticate, UsuariosController.updateOwnProfile);
// Cambiar contraseña
router.put("/:rut/change-password", authenticate, UsuariosController.updateUserPassword);
// Actualizar un usuario
router.put('/:rut', authenticate, checkPermissions('editar_usuarios'), UsuariosController.update);
// Desactivar un usuario
router.delete('/:rut', authenticate, checkPermissions('eliminar_usuarios'), UsuariosController.deactivate);
// Cambiar la contraseña de un usuario
router.post('/change-password', authenticate, UsuariosController.changePassword); 

export default router;
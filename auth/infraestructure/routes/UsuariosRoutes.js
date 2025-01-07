import { Router } from 'express';
import UsuariosController from '../controllers/UsuariosController.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';
import authenticate from '../../../shared/middlewares/authenticate.js';

const router = Router();

// Rutas protegidas con VerifyToken
router.use(verifyToken);

// Ruta para crear usuario, protegida con el middleware para verificar el permiso 'crear_usuario'
router.post('/', checkPermissions('crear_usuarios'), UsuariosController.create);

router.post('/crear', checkPermissions('crear_usuarios'), UsuariosController.createNewUser);

// Obtener todos los usuarios
router.get('/', checkPermissions('ver_usuarios'), UsuariosController.getAllUsers);

// Obtener todos los usuarios rol chofer
router.get('/choferes', authenticate, UsuariosController.getAllChoferes);

router.get('/mi-perfil', authenticate, UsuariosController.getOwnProfile);
// Obtener un usuario por RUT
router.get('/:rut', /* checkPermissions('ver_usuario'), */ authenticate,UsuariosController.findByRut);

router.put('/mi-perfil', authenticate, UsuariosController.updateOwnProfile);

router.put("/:rut/change-password", authenticate, UsuariosController.updateUserPassword);


// Actualizar un usuario
router.put('/:rut', checkPermissions('editar_usuarios'), UsuariosController.update);

// Desactivar un usuario
router.delete('/:rut',checkPermissions('eliminar_usuarios'), UsuariosController.deactivate);

// Cambiar la contraseña de un usuario
router.post('/change-password', authenticate, UsuariosController.changePassword); 

export default router;
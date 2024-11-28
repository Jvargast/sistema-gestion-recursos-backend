import { Router } from 'express';
import UsuariosController from '../controllers/UsuariosController.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();

// Rutas protegidas con VerifyToken
router.use(verifyToken);

// Ruta para crear usuario, protegida con el middleware para verificar el permiso 'crear_usuario'
router.post('/', checkPermissions('crear_usuarios'), UsuariosController.create);

// Obtener todos los usuarios
router.get('/', checkPermissions('ver_usuarios'), UsuariosController.getAllUsers);

// Obtener un usuario por RUT
router.get('/:rut', /* checkPermissions('ver_usuario'), */ UsuariosController.findByRut);

// Actualizar un usuario
router.put('/:rut', checkPermissions('editar_usuarios'), UsuariosController.update);

// Desactivar un usuario
router.delete('/:rut',checkPermissions('eliminar_usuarios'), UsuariosController.deactivate);

// Cambiar la contraseña de un usuario
router.post('/change-password', UsuariosController.changePassword); 

export default router;
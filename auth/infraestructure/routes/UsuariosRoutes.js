import { Router } from 'express';
import UsuarioController from '../controllers/UsuariosController.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';

const router = Router();

// Rutas protegidas con VerifyToken
router.use(VerifyToken);

// Ruta para crear usuario, protegida con el middleware para verificar el permiso 'crear_usuario'
router.post('/', checkPermissions('crear_usuario'), UsuarioController.create);

// Obtener todos los usuarios
router.get('/', checkPermissions('ver_usuarios'), UsuarioController.findAll);

// Obtener un usuario por RUT
router.get('/:rut', checkPermissions('ver_usuario'), UsuarioController.findByRut);

// Actualizar un usuario
router.put('/:rut', checkPermissions('actualizar_usuario'), UsuarioController.update);

// Desactivar un usuario
router.delete('/:rut',checkPermissions('desactivar_usuario'), UsuarioController.deactivate);

// Cambiar la contraseña de un usuario
router.post('/change-password', UsuarioController.changePassword);

export default router;
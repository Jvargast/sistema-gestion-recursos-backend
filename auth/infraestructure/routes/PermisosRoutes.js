import { Router } from 'express';
import PermisosController from '../controllers/PermisosController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';

const router = Router();

// Middleware de autenticación


// Crear un permiso
router.post('/', authenticate, PermisosController.createPermiso);

// Actualizar un permiso
router.put('/:id', authenticate, PermisosController.updatePermiso);

// Eliminar un permiso
router.delete('/:id', authenticate, PermisosController.deletePermiso);

// Obtener todos los permisos
router.get('/', authenticate, PermisosController.getAllPermisos);

// Obtener un permiso por ID
router.get('/:id', authenticate, PermisosController.getPermisoById);

export default router;
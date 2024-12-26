import { Router } from 'express';
import PermisosController from '../controllers/PermisosController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();

// Middleware de autenticación
router.use(verifyToken);

// Crear un permiso
router.post('/', PermisosController.createPermiso);

// Actualizar un permiso
router.put('/:id', PermisosController.updatePermiso);

// Eliminar un permiso
router.delete('/:id', PermisosController.deletePermiso);

// Obtener todos los permisos
router.get('/', PermisosController.getAllPermisos);

// Obtener un permiso por ID
router.get('/:id', PermisosController.getPermisoById);

export default router;
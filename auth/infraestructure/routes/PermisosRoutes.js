import { Router } from 'express';
import PermisosController from '../controllers/PermisosController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();

// Middleware de autenticación
router.use(verifyToken);

// Crear un permiso
router.post('/', PermisosController.create);

// Actualizar un permiso
router.put('/:id', PermisosController.update);

// Eliminar un permiso
router.delete('/:id', PermisosController.delete);

// Obtener todos los permisos
router.get('/', PermisosController.findAll);

// Obtener un permiso por ID
router.get('/:id', PermisosController.findById);

export default router;

import { Router } from 'express';
import RolController from '../controllers/RolController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';
import authenticate from '../../../shared/middlewares/authenticate.js';

const router = Router();

// Rutas protegidas con VerifyToken
router.use(verifyToken);

// Crear un rol
router.post('/', authenticate, RolController.createRole);

// Obtener todos los roles
router.get('/', authenticate, RolController.getAllRoles);

// Obtener un rol por ID
router.get('/:id', authenticate, RolController.getRoleById);

// Actualizar un rol
router.put('/:id', authenticate, RolController.updateRole);

// Eliminar un rol
router.delete('/:id', authenticate, RolController.deleteRol);

export default router;
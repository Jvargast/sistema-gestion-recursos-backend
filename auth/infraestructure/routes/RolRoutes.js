import { Router } from 'express';
import RolController from '../controllers/RolController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();

// Rutas protegidas con VerifyToken
router.use(verifyToken);

// Crear un rol
router.post('/', RolController.createRole);

// Obtener todos los roles
router.get('/', RolController.getAllRoles);

// Obtener un rol por ID
router.get('/:id', RolController.getRoleById);

// Actualizar un rol
router.put('/:id', RolController.updateRole);

// Eliminar un rol
router.delete('/:id', RolController.deleteRol);

export default router;
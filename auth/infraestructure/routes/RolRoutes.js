import { Router } from 'express';
import RolController from '../controllers/RolController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();

// Rutas protegidas con VerifyToken
router.use(verifyToken);

// Crear un rol
router.post('/', RolController.create);

// Obtener todos los roles
router.get('/', RolController.findAll);

// Obtener un rol por ID
router.get('/:id', RolController.findById);

// Actualizar un rol
router.put('/:id', RolController.update);

// Eliminar un rol
router.delete('/:id', RolController.delete);

export default router;
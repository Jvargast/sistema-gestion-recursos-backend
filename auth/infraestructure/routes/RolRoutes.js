import { Router } from 'express';
import RolController from '../controllers/RolController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();

// Rutas protegidas con VerifyToken
router.use(verifyToken);

// Crear un rol
router.post('/roles', RolController.create);

// Obtener todos los roles
router.get('/roles', RolController.findAll);

// Obtener un rol por ID
router.get('/roles/:id', RolController.findById);

// Actualizar un rol
router.put('/roles/:id', RolController.update);

// Eliminar un rol
router.delete('/roles/:id', RolController.delete);

export default router;
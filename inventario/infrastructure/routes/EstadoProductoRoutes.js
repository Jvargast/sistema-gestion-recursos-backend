import { Router } from 'express';
import EstadoProductoController from '../controllers/EstadoProductoController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();
router.use(verifyToken);
router.get('/:id', EstadoProductoController.getEstadoById);
router.get('/', EstadoProductoController.getAllEstados);
router.post('/', EstadoProductoController.createEstado);
router.put('/:id', EstadoProductoController.updateEstado);
router.delete('/:id', EstadoProductoController.deleteEstado);

export default router;

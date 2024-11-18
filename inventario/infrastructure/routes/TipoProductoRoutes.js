import { Router } from 'express';
import TipoProductoController from '../controllers/TipoProductoController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();
router.use(verifyToken);
router.get('/:id', TipoProductoController.getTipoById);
router.get('/', TipoProductoController.getAllTipos);
router.post('/', TipoProductoController.createTipo);
router.put('/:id', TipoProductoController.updateTipo);
router.delete('/:id', TipoProductoController.deleteTipo);

export default router;

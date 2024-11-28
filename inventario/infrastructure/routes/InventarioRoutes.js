import { Router } from 'express';
import InventarioController from '../controllers/InventarioController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();
router.use(verifyToken);
router.get('/:id_producto', InventarioController.getInventarioByProductoId);
router.get('/', InventarioController.getAllInventarios);
router.post('/', InventarioController.createInventario);
router.put('/:id_producto', InventarioController.ajustarCantidad);
router.delete('/:id_producto', InventarioController.deleteInventario);

export default router;

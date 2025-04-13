import { Router } from 'express';
import InventarioController from '../controllers/InventarioController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';

const router = Router();
router.use(authenticate);
router.get('/', checkPermissions("inventario.inventario.ver"),InventarioController.getAllInventarios);
router.get('/:id_producto', checkPermissions("inventario.inventario.ver"), InventarioController.getInventarioByProductoId);
router.post('/', checkPermissions("inventario.inventario.crear"), InventarioController.createInventario);
router.put('/:id_producto', checkPermissions("inventario.inventario.editar"), InventarioController.ajustarCantidad);
router.delete('/:id_producto', checkPermissions("inventario.inventario.eliminar"),InventarioController.deleteInventario);

export default router;

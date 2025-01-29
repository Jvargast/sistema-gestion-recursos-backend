import { Router } from 'express';
import ProductoController from '../controllers/ProductoController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';

const router = Router();

router.get('/disponible', authenticate, checkPermissions("ver_productos_disponibles"), ProductoController.getAvailableProductos)
router.get('/:id', authenticate, checkPermissions("ver_producto"),ProductoController.getProductoById);
router.get('/', authenticate, checkPermissions("ver_productos"),ProductoController.getAllProductos);
router.post('/', authenticate, checkPermissions("crear_producto"),ProductoController.createProducto);
router.put('/:id', authenticate, checkPermissions("editar_producto"),ProductoController.updateProducto);
router.patch('/', authenticate, checkPermissions("borrar_productos"),ProductoController.deleteProductos);
router.delete('/:id', authenticate, checkPermissions("borrar_producto"),ProductoController.deleteProducto);

export default router;

import { Router } from 'express';
import ProductoController from '../controllers/ProductoController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/disponible', checkPermissions("inventario.producto.disponible"), ProductoController.getAvailableProductos)
router.get('/:id', checkPermissions("inventario.producto.ver"),ProductoController.getProductoById);
router.get('/', checkPermissions("inventario.producto.ver"),ProductoController.getAllProductos);
router.post('/', checkPermissions("inventario.producto.crear"),ProductoController.createProducto);
router.put('/:id', checkPermissions("inventario.producto.editar"),ProductoController.updateProducto);
router.patch('/', checkPermissions("inventario.producto.eliminar"),ProductoController.deleteProductos);
router.delete('/:id', checkPermissions("inventario.producto.eliminar"),ProductoController.deleteProducto);

export default router;

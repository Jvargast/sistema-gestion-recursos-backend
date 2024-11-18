import { Router } from 'express';
import ProductoController from '../controllers/ProductoController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();
router.use(verifyToken);
router.get('/:id', ProductoController.getProductoById);
router.get('/', ProductoController.getAllProductos);
router.get('/tipo/:tipo', ProductoController.getProductosByTipo); // Ruta para obtener productos por tipo
router.post('/', ProductoController.createProducto);
router.put('/:id', ProductoController.updateProducto);
router.delete('/:id', ProductoController.deleteProducto);

export default router;

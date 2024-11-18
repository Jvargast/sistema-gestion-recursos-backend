import { Router } from 'express';
import CategoriaProductoController from '../controllers/CategoriaProductoController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';

const router = Router();
router.use(verifyToken);
router.get('/:id', CategoriaProductoController.getCategoriaById);
router.get('/', CategoriaProductoController.getAllCategorias);
router.post('/', CategoriaProductoController.createCategoria);
router.put('/:id', CategoriaProductoController.updateCategoria);
router.delete('/:id', CategoriaProductoController.deleteCategoria);

export default router;

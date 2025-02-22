import { Router } from 'express';
import CategoriaProductoController from '../controllers/CategoriaProductoController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';


const router = Router();

router.get('/:id', authenticate, CategoriaProductoController.getCategoriaById);
router.get('/', authenticate, CategoriaProductoController.getAllCategorias);
router.post('/', authenticate, CategoriaProductoController.createCategoria);
router.put('/:id', authenticate, CategoriaProductoController.updateCategoria);
router.delete('/:id', authenticate, CategoriaProductoController.deleteCategoria);

export default router;

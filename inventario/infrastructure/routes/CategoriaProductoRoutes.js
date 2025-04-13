import { Router } from 'express';
import CategoriaProductoController from '../controllers/CategoriaProductoController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';


const router = Router();
router.use(authenticate)
router.get('/:id', checkPermissions("inventario.categoriaproducto.ver"), CategoriaProductoController.getCategoriaById);
router.get('/', checkPermissions("inventario.categoriaproducto.ver"), CategoriaProductoController.getAllCategorias);
router.post('/', checkPermissions("inventario.categoriaproducto.crear"), CategoriaProductoController.createCategoria);
router.put('/:id', checkPermissions("inventario.categoriaproducto.editar"), CategoriaProductoController.updateCategoria);
router.delete('/:id', checkPermissions("inventario.categoriaproducto.eliminar"), CategoriaProductoController.deleteCategoria);

export default router;

import { Router } from 'express';
import EstadoProductoController from '../controllers/EstadoProductoController.js';
import verifyToken from '../../../shared/middlewares/VerifyTokenMiddleware.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/:id', checkPermissions("inventario.estadoproducto.ver") ,EstadoProductoController.getEstadoById);
router.get('/', checkPermissions("inventario.estadoproducto.ver"), EstadoProductoController.getAllEstados);
router.post('/', checkPermissions("inventario.estadoproducto.crear"), EstadoProductoController.createEstado);
router.put('/:id', checkPermissions("inventario.estadoproducto.editar"), EstadoProductoController.updateEstado);
router.delete('/:id', checkPermissions("inventario.estadoproducto.eliminar"), EstadoProductoController.deleteEstado);

export default router;

import { Router } from 'express';
import TipoInsumoController from '../controllers/TipoInsumoController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';


const router = Router();
router.use(authenticate)

router.get('/:id', checkPermissions("inventario.tipoinsumo.ver"), TipoInsumoController.getTipoById);
router.get('/', checkPermissions("inventario.tipoinsumo.ver"), TipoInsumoController.getAllTipos);
router.post('/', checkPermissions("inventario.tipoinsumo.crear"), TipoInsumoController.createTipo);
router.put('/:id', checkPermissions("inventario.tipoinsumo.editar"), TipoInsumoController.updateTipo);
router.delete('/:id', checkPermissions("inventario.tipoinsumo.eliminar"), TipoInsumoController.deleteTipo);

export default router;

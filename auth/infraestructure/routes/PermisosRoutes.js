import { Router } from 'express';
import PermisosController from '../controllers/PermisosController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';

const router = Router();

router.use(authenticate)

router.post('/', checkPermissions("auth.permisos.crear") ,PermisosController.createPermiso);
router.put('/:id', checkPermissions("auth.permisos.editar"),PermisosController.updatePermiso);
router.delete('/:id', checkPermissions("auth.permisos.eliminar"), PermisosController.deletePermiso);
router.get('/', checkPermissions("auth.permisos.ver"), PermisosController.getAllPermisos);
router.get('/:id', checkPermissions("auth.permisos.ver"),PermisosController.getPermisoById);

export default router;
import { Router } from 'express';
import RolController from '../controllers/RolController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', checkPermissions("auth.roles.crear"), RolController.createRole);
router.get('/', checkPermissions("auth.roles.ver"), RolController.getAllRoles);
router.get('/:id', checkPermissions("auth.roles.ver"), RolController.getRoleById);
router.put('/:id', checkPermissions("auth.roles.editar"), RolController.updateRole);
router.delete('/:id', checkPermissions("auth.roles.eliminar"), RolController.deleteRol);

export default router;
import { Router } from 'express';
import UsuariosController from '../controllers/UsuariosController.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import { checkRoles } from '../../../shared/middlewares/CheckRole.js';

const router = Router();
router.use(authenticate);

router.post('/', checkPermissions("auth.usuarios.crear"), UsuariosController.create);
router.post('/crear', checkPermissions("auth.usuarios.crear"), UsuariosController.createNewUser);
router.get('/', checkPermissions('auth.usuarios.ver'), UsuariosController.getAllUsers);
router.get('/choferes', checkRoles(["administrador", "chofer"]), checkPermissions("auth.usuario.choferes"), UsuariosController.getAllChoferes);
router.get('/vendedores', checkPermissions("auth.usuario.vendedores"), UsuariosController.getAllVendedores);
router.get('/usuarios-con-caja', checkPermissions("auth.usuario.vendedores"), UsuariosController.getAllUsuariosConCaja);
router.get('/mi-perfil', checkPermissions("auth.perfil.ver"),UsuariosController.getOwnProfile);
router.get('/:rut', checkPermissions('auth.usuarios.ver'), UsuariosController.findByRut);
router.put('/mi-perfil', checkPermissions("auth.perfil.actualizar"), UsuariosController.updateOwnProfile);
router.put("/:rut/change-password", checkPermissions("auth.perfil.actualizar"), UsuariosController.updateUserPassword);
router.put('/:rut', checkPermissions('auth.usuarios.editar'), UsuariosController.update);
router.delete('/:rut', checkPermissions('auth.usuarios.eliminar'), UsuariosController.deactivate);
router.post('/change-password', checkPermissions("auth.perfil.actualizar"), UsuariosController.changePassword); 

export default router;
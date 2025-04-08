import express from 'express';
import EntregasController from '../controllers/EntregasController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import ChoferController from '../controllers/ChoferController.js';
import { checkRoles } from '../../../shared/middlewares/CheckRole.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.post('/', checkPermissions("entregas.entrega.crear"), checkRoles(["chofer"]), EntregasController.createEntrega);
router.get('/por-agenda/', checkPermissions("entregas.entrega.misentregas"), EntregasController.getEntregasByAgendaId);
router.get('/choferes/disponibles', checkPermissions("entregas.entrega.disponibles") ,ChoferController.getChoferesDisponibles);
router.get('/:id', checkPermissions("entregas.entrega.ver") ,EntregasController.getEntregaById);
router.get('/', checkPermissions("entregas.entrega.ver"), EntregasController.getAll);
//router.put('/:id', EntregaController.update); // Actualizar una entrega
//router.delete('/:id', EntregaController.delete); // Eliminar una entrega

export default router;
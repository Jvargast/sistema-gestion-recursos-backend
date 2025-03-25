import express from 'express';
import EntregasController from '../controllers/EntregasController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import ChoferController from '../controllers/ChoferController.js';
import { checkRoles } from '../../../shared/middlewares/CheckRole.js';

const router = express.Router();

// Rutas para Entrega

// Rutas para Entrega
router.post('/', authenticate, checkRoles(["chofer"]), EntregasController.createEntrega);

// ⚠️ Las rutas más específicas deben ir antes
router.get('/por-agenda/', EntregasController.getEntregasByAgendaId);
router.get('/choferes/disponibles', ChoferController.getChoferesDisponibles);

router.get('/:id', EntregasController.getEntregaById);
router.get('/', EntregasController.getAll);
//router.put('/:id', EntregaController.update); // Actualizar una entrega
//router.delete('/:id', EntregaController.delete); // Eliminar una entrega

export default router;
import express from 'express';
import EntregasController from '../controllers/EntregasController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import ChoferController from '../controllers/ChoferController.js';

const router = express.Router();

// Rutas para Entrega
router.post('/', authenticate, EntregasController.createEntrega); 
router.get('/:id', EntregasController.getEntregaById); 
router.get('/', EntregasController.getAll); 
router.get("/choferes/disponibles", ChoferController.getChoferesDisponibles);
//router.put('/:id', EntregaController.update); // Actualizar una entrega
//router.delete('/:id', EntregaController.delete); // Eliminar una entrega

export default router;
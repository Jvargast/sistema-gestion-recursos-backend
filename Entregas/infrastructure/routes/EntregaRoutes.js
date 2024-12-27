import express from 'express';
import EntregasController from '../controllers/EntregasController.js';

const router = express.Router();

// Rutas para Entrega
router.post('/', EntregasController.createEntrega); // Crear una nueva entrega
router.get('/:id', EntregasController.getEntregaById); // Obtener una entrega por ID
router.get('/', EntregasController.getAll); // Obtener todas las entregas
//router.put('/:id', EntregaController.update); // Actualizar una entrega
//router.delete('/:id', EntregaController.delete); // Eliminar una entrega

export default router;
import { Router } from 'express';
import InventarioController from '../controllers/InventarioController.js';

const router = Router();

// Crear inventario inicial
router.post('/inventario', InventarioController.createStock);

// Actualizar inventario
router.put('/inventario', InventarioController.updateStock);

// Obtener inventario por producto
router.get('/inventario/:id_producto', InventarioController.getStock);

export default router;

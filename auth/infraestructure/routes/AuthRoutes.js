import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';

const router = Router();

// Ruta para iniciar sesión
router.post('/login', AuthController.login);

// Ruta para cerrar sesión
router.post('/logout', AuthController.logout);

export default router;
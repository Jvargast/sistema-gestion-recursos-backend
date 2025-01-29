import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';

const router = Router();

// Ruta para iniciar sesión
router.post('/login', AuthController.login);

// Ruta para obtener usuario autenticado
router.get('/me', authenticate, AuthController.getAuthenticatedUser);

// Ruta para renovar el access token
router.post("/refresh-token", AuthController.refreshToken);

// Ruta para cerrar sesión
router.post('/logout', authenticate, AuthController.logout);

export default router;
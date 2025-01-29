import { Router } from 'express';
import TipoInsumoController from '../controllers/TipoInsumoController.js';
import authenticate from '../../../shared/middlewares/authenticate.js';


const router = Router();

router.get('/:id', authenticate, TipoInsumoController.getTipoById);
router.get('/', authenticate, TipoInsumoController.getAllTipos);
router.post('/', authenticate, TipoInsumoController.createTipo);
router.put('/:id', authenticate, TipoInsumoController.updateTipo);
router.delete('/:id', authenticate, TipoInsumoController.deleteTipo);

export default router;

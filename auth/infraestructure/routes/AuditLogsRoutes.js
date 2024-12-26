import { Router } from 'express';
import AuditLogsController from '../controllers/AuditLogsController.js';



const router = Router();

router.post("/", AuditLogsController.createLog); // Crear un log
router.get("/", AuditLogsController.getLogs); // Obtener todos los logs

export default router;

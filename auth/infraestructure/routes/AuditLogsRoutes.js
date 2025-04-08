import { Router } from 'express';
import AuditLogsController from '../controllers/AuditLogsController.js';
import checkPermissions from '../../../shared/middlewares/CheckPermissionsMiddleware.js';
import authenticate from '../../../shared/middlewares/authenticate.js';



const router = Router();

router.use(authenticate);

router.post("/", checkPermissions("auth.auditLogs.crear") ,AuditLogsController.createLog);
router.get("/", checkPermissions("auth.auditLogs.ver"),AuditLogsController.getLogs); 

export default router;

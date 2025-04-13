import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import LogVentaController from "../controllers/LogVentaController.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate)

router.get("/", checkPermissions("ventas.logventa.ver"), LogVentaController.getAllLogs);


export default router;

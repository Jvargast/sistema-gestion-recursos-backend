import { Router } from "express";
import SecuritySettingsController from "../controllers/SecuritySettingsController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();

router.use(authenticate)
router.get("/", checkPermissions("auth.securitysettings.ver"), SecuritySettingsController.getSettings);
router.put("/", checkPermissions("auth.securitysettings.editar"), SecuritySettingsController.updateSettings);

export default router;

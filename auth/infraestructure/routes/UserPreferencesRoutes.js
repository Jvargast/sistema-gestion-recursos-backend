import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";
import UserPreferencesController from "../controllers/UserPreferencesController.js";

const router = Router();

router.use(authenticate);

router.get(
  "/me/preferences",
  checkRoles(["administrador", "vendedor"]),
 /*  checkPermissions("auth.preferences.ver"), */
  UserPreferencesController.getMine
);


router.put(
  "/me/preferences",
  checkRoles(["administrador", "vendedor"]),
/*   checkPermissions("auth.preferences.editar"), */
  UserPreferencesController.saveMine
);

router.delete(
  "/me/preferences",
  checkRoles(["administrador", "vendedor"]),
/*   checkPermissions("auth.preferences.eliminar"), */
  UserPreferencesController.clearMine
);

export default router;

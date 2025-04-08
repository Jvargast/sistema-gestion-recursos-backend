import { Router } from "express";
import CamionController from "../controllers/CamionController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate)

router.post("/", checkPermissions("entregas.camion.crear"), CamionController.create);
router.get("/", checkPermissions("entregas.camion.ver"), CamionController.getAll);
router.get("/capacidad/chofer/:id_chofer", checkPermissions("entregas.camion.capacidad"), CamionController.getCamionCapacityByChoferId)
router.get("/capacidad/:id_camion", checkPermissions("entregas.camion.capacidad"), CamionController.getCamionCapacity)
router.get("/:id", authenticate, CamionController.getById);
router.put("/:id", authenticate, CamionController.update);
router.patch("/:id/asignar-chofer", authenticate, checkRoles(["administrador"]), CamionController.asignarChofer);
router.patch("/:id/desasignar-chofer", authenticate, checkRoles(["administrador"]), CamionController.desasignarChofer);
router.delete("/:id", authenticate, CamionController.delete);

export default router;
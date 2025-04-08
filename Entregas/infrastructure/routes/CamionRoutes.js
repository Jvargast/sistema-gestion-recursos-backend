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
router.get("/:id", checkPermissions("entregas.camion.ver"), CamionController.getById);
router.put("/:id", checkPermissions("entregas.camion.editar"), CamionController.update);
router.patch("/:id/asignar-chofer", checkPermissions("entregas.camion.asignar"), checkRoles(["administrador"]), CamionController.asignarChofer);
router.patch("/:id/desasignar-chofer", checkPermissions("entregas.camion.desasignar"), checkRoles(["administrador"]), CamionController.desasignarChofer);
router.delete("/:id", checkPermissions("entregas.camion.eliminar"), CamionController.delete);

export default router;
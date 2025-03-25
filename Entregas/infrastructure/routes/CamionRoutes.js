import { Router } from "express";
import CamionController from "../controllers/CamionController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";

const router = Router();

router.post("/", authenticate, CamionController.create);
router.get("/", authenticate, CamionController.getAll);
router.get("/capacidad/chofer/:id_chofer", authenticate, CamionController.getCamionCapacityByChoferId)
router.get("/capacidad/:id_camion", authenticate, CamionController.getCamionCapacity)
router.get("/:id", authenticate, CamionController.getById);
router.put("/:id", authenticate, CamionController.update);
router.patch("/:id/asignar-chofer", authenticate, checkRoles(["administrador"]), CamionController.asignarChofer);
router.patch("/:id/desasignar-chofer", authenticate, checkRoles(["administrador"]), CamionController.desasignarChofer);
router.delete("/:id", authenticate, CamionController.delete);

export default router;
import { Router } from "express";
import AgendaController from "../controllers/AgendaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";


const router = Router();

router.post("/", AgendaController.create);
router.get("/", authenticate, AgendaController.getAll);
router.get("/agendaChofer", authenticate, checkRoles(["chofer"]), AgendaController.getAgendasByChofer);
router.put("/start/:id", authenticate, AgendaController.startAgenda);
router.put("/finalizar/:id", authenticate, AgendaController.finalizeAgenda);
router.get('/:id', AgendaController.getById);
router.put('/:id', AgendaController.update); // Actualizar una agenda
router.delete('/:id', AgendaController.delete); 

export default router;
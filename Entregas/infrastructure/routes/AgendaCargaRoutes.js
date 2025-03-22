import { Router } from "express";
import AgendaController from "../controllers/AgendaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";


const router = Router();

router.post("/confirmar-carga", authenticate, checkRoles(["chofer"]), AgendaController.confirmarCargaCamion)
router.get("/agenda/hoy", authenticate, checkRoles(["chofer"]), AgendaController.getAgendaCargaDelDia);
router.post("/", authenticate, AgendaController.createAgenda);
router.get("/:id", authenticate, AgendaController.getAgendaById);
/* router.get("/", authenticate, AgendaController.getAll);
router.get("/agendaChofer", authenticate, checkRoles(["chofer"]), AgendaController.getAgendasByChofer);
router.get("/activa/chofer", authenticate,AgendaController.getAgendaActiva);
router.get('/:id', AgendaController.getById);
router.delete('/:id', AgendaController.delete);  */

export default router;
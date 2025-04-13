import { Router } from "express";
import AgendaController from "../controllers/AgendaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";


const router = Router();
router.use(authenticate);

router.post("/confirmar-carga", checkPermissions("entregas.agendacarga.confirmar"), AgendaController.confirmarCargaCamion)
router.get("/agenda/hoy", checkPermissions("entregas.agendacarga.ver"), checkRoles(["chofer", "administrador"]), AgendaController.getAgendaCargaDelDia);
router.get("/", checkPermissions("entregas.agendacarga.ver"), checkRoles(["administrador"]), AgendaController.getAllAgendas);
router.post("/", checkPermissions("entregas.agendacarga.crear"), AgendaController.createAgenda);
router.get("/:id",  checkPermissions("entregas.agendacarga.ver"), AgendaController.getAgendaById);

export default router;
import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import AgendaViajesController from "../controllers/AgendaViajesController.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate);

router.get(
  "/chofer/:id_chofer",
  checkPermissions("entregas.agendaviaje.ver"),
  checkRoles(["administrador", "chofer"]),
  AgendaViajesController.getViajeChofer
);
router.get(
  "/",
  checkPermissions("entregas.agendaviaje.ver"),
  checkRoles(["administrador", "chofer"]),
  AgendaViajesController.getAllViajes
);
router.get(
  "/historial",
  checkPermissions("entregas.agendaviaje.ver"),
  checkRoles(["administrador"]),
  AgendaViajesController.getHistorialViajes
);
router.get(
  "/historial/:id_chofer",
  checkPermissions("entregas.agendaviaje.mihistorial"),
  checkRoles(["chofer"]),
  AgendaViajesController.getHistorialViajesChofer
);
router.post(
  "/:id_agenda_viaje/finalizar",
  checkPermissions("entregas.agendaviaje.finalizar"),
  checkRoles(["chofer"]),
  AgendaViajesController.finalizarViaje
);
router.get(
  "/:id",
  checkPermissions("entregas.agendaviaje.ver"),
  AgendaViajesController.getAgendaViajeById
);

export default router;

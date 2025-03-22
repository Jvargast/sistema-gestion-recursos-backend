import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import AgendaViajesController from "../controllers/AgendaViajesController.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";

const router = Router();

// Obtener todos los viajes en tránsito
router.get("/chofer/:id_chofer", authenticate, checkRoles(["administrador", "chofer"]), AgendaViajesController.getViajeChofer);
router.get("/", authenticate, checkRoles(["administrador", "chofer"]), AgendaViajesController.getAllViajes);
// Finalizar un viaje (se pasa el id_agenda_viaje en la URL y se recibe el flag en el body)
router.post("/:id_agenda_viaje/finalizar", authenticate, checkRoles(["chofer"]), AgendaViajesController.finalizarViaje);


export default router;

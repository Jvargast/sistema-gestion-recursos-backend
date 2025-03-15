import { Router } from "express";
import VentaChoferController from "../controllers/VentaChoferController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";

const router = Router();

router.get("/", authenticate, VentaChoferController.getVentasChofer);
router.post("/rapida", authenticate, checkRoles(["chofer"]), VentaChoferController.realizarVentaRapida);

export default router;
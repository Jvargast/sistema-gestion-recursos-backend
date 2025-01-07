import { Router } from "express";
import VentaChoferController from "../controllers/VentaChoferController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, VentaChoferController.getVentasChofer);
router.post("/rapida", authenticate, VentaChoferController.realizarVentaRapida);

export default router;
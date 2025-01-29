import { Router } from "express";
import VentaController from "../controllers/VentaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, VentaController.getAllVentas);
router.get("/:id", authenticate, VentaController.getVentaById);
router.post("/", authenticate, VentaController.createVenta);




export default router;

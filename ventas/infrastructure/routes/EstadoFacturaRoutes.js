import { Router } from "express";
import EstadoFacturaController from "../controllers/EstadoFacturaController.js";

const router = Router();

router.get("/", EstadoFacturaController.getAllEstadosFactura);

export default router;
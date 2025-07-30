import { Router } from "express";
import ChoferUbicacionController from "../controllers/ChoferUbicacionController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
const router = Router();

router.use(authenticate);

router.post("/:rut", ChoferUbicacionController.registrarUbicacion);

router.get("/:rut", ChoferUbicacionController.obtenerUltimaUbicacion);

export default router;

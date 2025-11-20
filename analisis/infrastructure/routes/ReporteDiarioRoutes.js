import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import ReporteDiarioController from "../controllers/ReporteDiarioController.js";

const router = Router();

router.get("/diario", authenticate, ReporteDiarioController.obtener);

export default router;

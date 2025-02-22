import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import LogVentaController from "../controllers/LogVentaController.js";

const router = Router();

router.get("/", authenticate, LogVentaController.getAllLogs);


export default router;

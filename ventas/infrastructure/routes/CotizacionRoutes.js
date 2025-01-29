import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import CotizacionController from "../controllers/CotizacionController.js";

const router = Router();

router.get("/", authenticate, CotizacionController.getAllCotizaciones);
router.get("/:id", authenticate, CotizacionController.getCotizacionById);
router.post("/", authenticate, CotizacionController.createCotizacion);




export default router;

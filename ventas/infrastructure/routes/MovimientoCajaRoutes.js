import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import MovimientoCajaController from "../controllers/MovimientoCajaController.js";


const router = Router();

router.get("/", authenticate, MovimientoCajaController.getAllMovimientos);
router.get("/caja/:id_caja", authenticate, MovimientoCajaController.getByCajaIdAndDate);


export default router;

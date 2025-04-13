import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import MovimientoCajaController from "../controllers/MovimientoCajaController.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";


const router = Router();
router.use(authenticate);

router.get("/", checkPermissions("ventas.movimientocaja.ver"), MovimientoCajaController.getAllMovimientos);
router.get("/caja/:id_caja", checkPermissions("ventas.movimientocaja.ver"), MovimientoCajaController.getByCajaIdAndDate);


export default router;

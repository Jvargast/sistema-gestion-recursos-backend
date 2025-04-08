import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import CuentaPorCobrarController from "../controllers/CuentaPorCobrarController.js";


const router = Router();

router.use(authenticate);
router.get("/", CuentaPorCobrarController.getAll);
router.get("/:id/pdf", CuentaPorCobrarController.getCuentaPdf);
router.get("/:id", CuentaPorCobrarController.getCuentaPorCobrarById);
router.post("/:id/pago", CuentaPorCobrarController.registrarPago);
router.patch('/:id', CuentaPorCobrarController.actualizarCuenta);



export default router;

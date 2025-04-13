import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import CuentaPorCobrarController from "../controllers/CuentaPorCobrarController.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";


const router = Router();

router.use(authenticate);
router.get("/", checkPermissions("ventas.factura.ver"), CuentaPorCobrarController.getAll);
router.get("/:id/pdf", checkPermissions("ventas.factura.pdf"), CuentaPorCobrarController.getCuentaPdf);
router.get("/:id", checkPermissions("ventas.factura.ver"), CuentaPorCobrarController.getCuentaPorCobrarById);
router.post("/:id/pago", checkPermissions("ventas.factura.registrar"), CuentaPorCobrarController.registrarPago);
router.patch('/:id', checkPermissions("ventas.factura.editar"), CuentaPorCobrarController.actualizarCuenta);



export default router;

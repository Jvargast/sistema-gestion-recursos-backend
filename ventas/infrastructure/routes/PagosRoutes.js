import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import PagosController from "../controllers/PagosController.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";
const router = Router();
router.use(authenticate);

router.get("/:id", checkPermissions("ventas.pago.ver"), PagosController.getPagoById);
router.get("/", checkPermissions("ventas.pago.ver"), PagosController.getAllPagos);
router.put("/:id", checkPermissions("ventas.pago.editar"), PagosController.updatePago);
router.delete("/:id", checkPermissions("ventas.pago.crear"), PagosController.deletePago);

export default router;

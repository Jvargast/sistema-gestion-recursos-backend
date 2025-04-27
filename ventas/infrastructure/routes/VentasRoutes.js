import { Router } from "express";
import VentaController from "../controllers/VentaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate);

router.get("/", checkPermissions("ventas.venta.ver"), VentaController.getAllVentas);
router.get("/:id", checkPermissions("ventas.venta.ver"), VentaController.getVentaById);
router.post("/", checkPermissions("ventas.venta.crear"), VentaController.createVenta);
router.put("/:id/rechazar", checkPermissions("ventas.venta.editar"), VentaController.rejectVenta);
router.delete("/:id", checkPermissions("ventas.venta.eliminar"), VentaController.deleteVenta);

/* router.post("/", checkPermissions("ventas.venta.editar"), VentaController.createVenta); */




export default router;

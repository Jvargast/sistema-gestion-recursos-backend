import { Router } from "express";
import VentaChoferController from "../controllers/VentaChoferController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  checkPermissions("entregas.ventaschofer.ver"),
  VentaChoferController.getVentasChofer
);
router.get(
  "/misventas",
  checkPermissions("entregas.ventaschofer.ver"),
  checkRoles(["chofer"]),
  VentaChoferController.getMisVentas
);

router.get(
  "/venta/:id",
  checkPermissions("entregas.ventaschofer.ver"),
  VentaChoferController.getVentaChoferById
);

router.post(
  "/rapida",
  checkPermissions("entregas.ventaschofer.crear"),
  checkRoles(["chofer"]),
  VentaChoferController.realizarVentaRapida
);

export default router;

import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import CotizacionController from "../controllers/CotizacionController.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate);

router.get("/", checkPermissions("ventas.cotizacion.ver"), CotizacionController.getAllCotizaciones);
router.get("/:id/pdf", checkPermissions("ventas.cotizacion.pdf"), CotizacionController.generarPdfCotizacion);
router.get("/:id", checkPermissions("ventas.cotizacion.ver"), CotizacionController.getCotizacionById);
router.put("/:id", checkPermissions("ventas.cotizacion.editar"), CotizacionController.actualizarCotizacion);
router.post("/", checkPermissions("ventas.cotizacion.crear"), CotizacionController.createCotizacion);
router.delete(
  "/:id",
  checkPermissions("ventas.cotizacion.eliminar"),
  CotizacionController.deleteCotizacion
);




export default router;

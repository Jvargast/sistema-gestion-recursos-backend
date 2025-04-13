import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import CajaController from "../controllers/CajaController.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate);

// Rutas específicas primero
router.get("/", checkPermissions("ventas.caja.ver"), CajaController.getAllCajas);
router.get("/estado", checkPermissions("ventas.caja.estado"), CajaController.getEstadoCaja);
router.get("/asignada", checkPermissions("ventas.caja.asignada"), CajaController.getCajaAsignada);
router.put("/asignar", checkPermissions("ventas.caja.asignar"), CajaController.asignarCaja);
router.post("/abrir", checkPermissions("ventas.caja.abrir"), CajaController.openCaja);
router.post("/cerrar", checkPermissions("ventas.caja.cerrar"), CajaController.closeCaja);
// Rutas dinámicas al final
router.get("/:id", checkPermissions("ventas.caja.ver"), CajaController.getCajaById);
router.put("/:id", checkPermissions("ventas.caja.editar"), CajaController.updateCaja);
router.post("/", checkPermissions("ventas.caja.crear"), CajaController.createCaja);


export default router;

import { Router } from "express";
import InsumoController from "../controllers/InsumoController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate);

router.get("/", checkPermissions("inventario.insumo.ver"), InsumoController.getAllInsumos);
router.get("/vendibles", checkPermissions("inventario.insumo.disponible"), InsumoController.getAllInsumosVendibles);
router.get("/:id", checkPermissions("inventario.insumo.ver"), InsumoController.getInsumoById);
router.post("/", checkPermissions("inventario.insumo.crear"),InsumoController.createInsumo);
router.put("/:id", checkPermissions("inventario.insumo.editar"), InsumoController.updateInsumo);
router.delete("/", checkPermissions("inventario.insumo.eliminar"), InsumoController.deleteInsumo);

export default router;

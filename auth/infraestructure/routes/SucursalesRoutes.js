import express from "express";
import SucursalController from "../controllers/SucursalController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = express.Router();
router.use(authenticate);

router.get("/", checkPermissions("auth.sucursal.ver"), SucursalController.getAllSucursals);
router.get("/:id", checkPermissions("auth.sucursal.ver"), SucursalController.getSucursalById);
router.get("/buscar", checkPermissions("auth.sucursal.ver"), SucursalController.getSucursalByNombre);
router.get("/usuario/:rutUsuario", checkPermissions("auth.sucursal.ver"), SucursalController.getSucursalByUsuario);
router.post("/", checkPermissions("auth.sucursal.crear"), SucursalController.createSucursal);     
router.put("/:id", checkPermissions("auth.sucursal.editar"), SucursalController.updateSucursal);
router.delete("/:id", checkPermissions("auth.sucursal.eliminar"), SucursalController.deleteSucursal);

export default router;

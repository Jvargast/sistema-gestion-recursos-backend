import express from "express";
import SucursalController from "../controllers/SucursalController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", authenticate, checkPermissions("ver_sucursales"),SucursalController.getAllSucursals);
router.get("/:id", authenticate, checkPermissions("ver_sucursal"),SucursalController.getSucursalById);
router.get("/buscar", authenticate,checkPermissions("buscar_sucursal"), SucursalController.getSucursalByNombre);
router.get("/usuario/:rutUsuario", authenticate, SucursalController.getSucursalByUsuario);
router.put("/:id", authenticate, checkPermissions("actualizar_sucursal"), SucursalController.updateSucursal);

export default router;

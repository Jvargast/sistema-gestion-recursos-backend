import express from "express";
import SucursalController from "../controllers/SucursalController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = express.Router();
router.use(authenticate);

router.get("/", checkPermissions("auth.sucursal.ver"),SucursalController.getAllSucursals);
router.get("/:id", checkPermissions("auth.sucursal.ver"),SucursalController.getSucursalById);
router.get("/buscar",checkPermissions("auth.sucursal.ver"), SucursalController.getSucursalByNombre);
router.get("/usuario/:rutUsuario",checkPermissions("auth.sucursal.ver") ,SucursalController.getSucursalByUsuario);
router.put("/:id", checkPermissions("auth.sucursal.editar"), SucursalController.updateSucursal);

export default router;

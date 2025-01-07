import express from "express";
import SucursalController from "../controllers/SucursalController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", authenticate, SucursalController.getAllSucursals);
router.get("/:id", authenticate, SucursalController.getSucursalById);
router.get("/buscar", authenticate, SucursalController.getSucursalByNombre);
router.get("/usuario/:rutUsuario", authenticate, SucursalController.getSucursalByUsuario);
router.put("/:id", authenticate, SucursalController.updateSucursal);

export default router;

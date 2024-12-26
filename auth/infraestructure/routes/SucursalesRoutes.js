import express from "express";
import SucursalController from "../controllers/SucursalController.js";

const router = express.Router();

router.get("/", SucursalController.getAllSucursals);
router.get("/:id", SucursalController.getSucursalById);
router.get("/buscar", SucursalController.getSucursalByNombre);
router.get("/usuario/:rutUsuario", SucursalController.getSucursalByUsuario);
router.put("/:id", SucursalController.updateSucursal);

export default router;

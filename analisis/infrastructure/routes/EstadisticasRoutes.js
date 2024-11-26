import express from "express";
import EstadisticasController from "../controllers/EstadisticasController.js";

const router = express.Router();

router.get("/productos/:id_producto", EstadisticasController.obtenerEstadisticasProducto);
router.get("/globales", EstadisticasController.obtenerEstadisticasGlobales);

export default router;

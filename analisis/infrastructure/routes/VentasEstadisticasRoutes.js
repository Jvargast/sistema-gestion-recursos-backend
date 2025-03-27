import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import VentasEstadisticasController from "../controllers/VentasEstadisticasController.js";

const router = Router();

router.post(
  "/ventas/generar",
  authenticate,
  VentasEstadisticasController.generar
);
router.get("/ventas", authenticate, VentasEstadisticasController.obtenerPorMes);
router.get(
  "/ventas/kpi-hoy",
  authenticate,
  VentasEstadisticasController.obtenerKpiDelDia
);
router.get(
  "/ventas/resumen-semanal",
  authenticate,
  VentasEstadisticasController.obtenerResumenSemanal
);

export default router;

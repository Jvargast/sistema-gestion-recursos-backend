import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import ProductoEstadisticasController from "../controllers/ProductoEstadisticasController.js";

const router = Router();

router.post(
  "/productos/generar",
  authenticate,
  ProductoEstadisticasController.generar
);
router.get(
  "/productos/kpi-hoy",
  authenticate,
  ProductoEstadisticasController.obtenerKpiDelDia
);
router.get(
  "/productos/resumen-por-fecha",
  authenticate,
  ProductoEstadisticasController.obtenerResumenPorFecha
);

router.get(
  "/productos",
  authenticate,
  ProductoEstadisticasController.obtenerPorMes
);

export default router;

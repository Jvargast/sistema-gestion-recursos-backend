import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import PedidosEstadisticasController from "../controllers/PedidosEstadisticasController.js";

const router = Router();

router.post("/pedidos/generar", authenticate, PedidosEstadisticasController.generar);
router.get("/pedidos", authenticate, PedidosEstadisticasController.obtenerPorMes);

export default router;

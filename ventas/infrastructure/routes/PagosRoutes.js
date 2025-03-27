import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import PagosController from "../controllers/PagosController.js";
const router = Router();
router.use(authenticate);

router.get("/:id", PagosController.getPagoById);
router.get("/", PagosController.getAllPagos);
router.put("/:id", PagosController.updatePago);
router.delete("/:id", PagosController.deletePago);

export default router;

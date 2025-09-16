import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import * as gastos from "../controllers/GastoController.js";

const router = Router();

router.use(authenticate);

router.post("/", gastos.crear);
router.get("/", gastos.listar);
router.get("/:id", gastos.obtener);
router.patch("/:id", gastos.actualizar);
router.delete("/:id", gastos.eliminar);

router.get("/:id/adjuntos", gastos.listarAdjuntos);
router.delete("/:id/adjuntos/:adjuntoId", gastos.eliminarAdjunto);

export default router;

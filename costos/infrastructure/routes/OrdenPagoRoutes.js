import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import * as ordenes from "../controllers/OrdenPagoController.js";

const router = Router();

router.use(authenticate);

router.post("/", ordenes.crear);
router.get("/", ordenes.listar);
router.get("/:id", ordenes.obtener);
router.put("/:id/items", ordenes.actualizarItems);
router.post("/:id/confirmar", ordenes.confirmar);
router.patch("/:id", ordenes.actualizar);
router.delete("/:id", ordenes.eliminar);

export default router;

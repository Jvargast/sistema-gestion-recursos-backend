import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import * as compras from "../controllers/ComprasController.js";

const router = Router();

router.use(authenticate);
router.post("/", compras.crear);
router.get("/", compras.listar);
router.get("/:id", compras.obtener);
router.post("/:id/recibir", compras.recibir);
router.patch("/:id", compras.actualizar);
router.delete("/:id", compras.eliminar);

export default router;

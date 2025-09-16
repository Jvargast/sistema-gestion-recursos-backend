import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import * as centros from "../controllers/CentroCostoController.js";

const router = Router();

router.use(authenticate);
router.post("/", centros.crear);
router.get("/", centros.listar);          
router.get("/:id", centros.obtener);
router.patch("/:id", centros.actualizar);
router.delete("/:id", centros.eliminar);

export default router;

import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import * as categorias from "../controllers/CategoriaGastoController.js";

const router = Router();

router.use(authenticate);
router.post("/", categorias.crear);
router.get("/", categorias.listar);
router.get("/:id", categorias.obtener);
router.patch("/:id", categorias.actualizar);
router.delete("/:id", categorias.eliminar);

export default router;

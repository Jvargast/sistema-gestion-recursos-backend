import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import * as proveedores from "../controllers/ProveedorController.js";

const router = Router();

router.use(authenticate);
router.post("/", proveedores.crear);
router.get("/", proveedores.listar); 
router.get("/:id", proveedores.obtener);
router.patch("/:id", proveedores.actualizar);
router.delete("/:id", proveedores.eliminar);

export default router;

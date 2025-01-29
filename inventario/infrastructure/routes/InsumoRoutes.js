import { Router } from "express";
import InsumoController from "../controllers/InsumoController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();

// Obtener todos los insumos
router.get("/", authenticate, checkPermissions("ver_insumos"), InsumoController.getAllInsumos);

// Obtener un insumo por ID
router.get("/:id", authenticate, checkPermissions("ver_insumo"), InsumoController.getInsumoById);

// Crear un nuevo insumo
router.post("/", authenticate, checkPermissions("crear_insumo"),InsumoController.createInsumo);

// Actualizar un insumo
router.put("/:id", authenticate, checkPermissions("editar_insumo"), InsumoController.updateInsumo);

// Eliminar un insumo
router.delete("/", authenticate, checkPermissions("borrar_insumo"), InsumoController.deleteInsumo);

export default router;

import { Router } from "express";
import EstadoTransaccionController from "../controllers/EstadoTransaccionController.js";

const router = Router();

router.get("/:id", EstadoTransaccionController.getEstadoById); // Obtener estado por ID
router.get("/", EstadoTransaccionController.getAllEstados); // Obtener todos los estados
router.post("/", EstadoTransaccionController.createEstado); // Crear un estado
router.put("/:id", EstadoTransaccionController.updateEstado); // Actualizar un estado
router.delete("/:id", EstadoTransaccionController.deleteEstado); // Eliminar un estado

export default router;

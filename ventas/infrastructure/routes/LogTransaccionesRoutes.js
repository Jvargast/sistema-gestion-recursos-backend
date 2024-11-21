import { Router } from "express";
import LogTransaccionController from "../controllers/LogTransaccionController.js";

const router = Router();

router.get("/:id_transaccion", LogTransaccionController.getLogsByTransaccion); // Obtener logs por transacción
router.get("/", LogTransaccionController.getAllLogs); // Obtener todos los logs con paginación
router.post("/", LogTransaccionController.createLog); // Crear un log

export default router;

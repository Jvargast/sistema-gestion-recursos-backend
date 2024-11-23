import { Router } from "express";
import TransaccionController from "../controllers/TransaccionController.js";

const router = Router();

router.get("/:id", TransaccionController.getTransaccionById); // Obtener transacción por ID
router.get("/", TransaccionController.getAllTransacciones); // Obtener todas las transacciones con filtros y paginación
router.post("/", TransaccionController.createTransaccion); // Crear una transacción
router.put("/:id/changeEstado", TransaccionController.changeEstado); // Cambiar estado de transacción
router.put("/:id/changeTipo", TransaccionController.changeTipoTransaccion); // Cambiar tipo de transacción
router.patch("/", TransaccionController.deleteTransacciones); // Eliminar transacciones

export default router;

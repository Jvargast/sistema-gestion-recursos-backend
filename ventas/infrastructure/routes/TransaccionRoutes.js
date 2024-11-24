import { Router } from "express";
import TransaccionController from "../controllers/TransaccionController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";

const router = Router();

router.use(verifyToken);

router.get("/:id", TransaccionController.getTransaccionById); // Obtener transacción por ID
router.get("/", TransaccionController.getAllTransacciones); // Obtener todas las transacciones con filtros y paginación
router.post("/", TransaccionController.createTransaccion); // Crear una transacción
router.put("/:id/changeEstado", authenticate ,TransaccionController.changeEstado); // Cambiar estado de transacción
router.put("/:id/changeTipo", TransaccionController.changeTipoTransaccion); // Cambiar tipo de transacción
router.patch("/", TransaccionController.deleteTransacciones); // Eliminar transacciones

export default router;

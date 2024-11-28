import { Router } from "express";
import TransaccionController from "../controllers/TransaccionController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";

const router = Router();

router.use(verifyToken);

router.get("/:id", authenticate, TransaccionController.getTransaccionById); // Obtener transacción por ID
router.get("/", authenticate, TransaccionController.getAllTransacciones); // Obtener todas las transacciones con filtros y paginación
router.post("/", authenticate, TransaccionController.createTransaccion); // Crear una transacción
router.put("/:id/changeEstado", authenticate, TransaccionController.changeEstado); // Cambiar estado de transacción
router.put("/:id/changeTipo", authenticate, TransaccionController.changeTipoTransaccion); // Cambiar tipo de transacción
router.put("/:id/changeDetalles", authenticate, TransaccionController.changeEstadoDetalles); // Cambiar estado detalles
router.patch("/", authenticate, TransaccionController.deleteTransacciones); // Eliminar transacciones
router.post("/:id/detalles", authenticate, TransaccionController.addDetallesToTransaccion);// Ruta para agregar detalles a una transacción existente
router.post("/:id/asignar", authenticate, TransaccionController.asignarTransaccion); // Ruta para asignar un usuario a la transacción existente

export default router;

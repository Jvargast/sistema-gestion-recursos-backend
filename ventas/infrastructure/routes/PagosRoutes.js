import express from "express";
import PagosController from "../controllers/PagosController.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";
import authenticate from "../../../shared/middlewares/authenticate.js";

const router = express.Router();

router.use(verifyToken);
// Acreditar un pago
router.post("/acreditar", authenticate, PagosController.acreditarPago);

// Obtener pagos por transacción
router.get("/:id_transaccion/pagos", authenticate, PagosController.obtenerPagosPorTransaccion);

// Cambiar el estado de un pago
router.patch("/:id_pago/estado", authenticate,  PagosController.cambiarEstadoPago);

// Obtener metodos de pagos
router.get("/metodos-pago", authenticate, PagosController.obtenerMetodosDePago);
export default router;

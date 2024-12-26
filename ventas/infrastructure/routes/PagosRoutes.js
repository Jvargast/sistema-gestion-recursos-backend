import express from "express";
import PagosController from "../controllers/PagosController.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";
import authenticate from "../../../shared/middlewares/authenticate.js";

const router = express.Router();

router.use(verifyToken);

// Obtener metodos de pagos
router.get("/metodos-pago", authenticate, PagosController.obtenerMetodosDePago);
// Obtener un pago
router.get("/:id", authenticate, PagosController.getPagoById);
// Actualizar pago
router.patch("/:id", authenticate, PagosController.updatePago);
// Acreditar un pago
router.post("/acreditar", authenticate, PagosController.acreditarPago);

// Obtener todos los pagos
router.get("/", authenticate, PagosController.getAllPagos);


// Borrar Pagos
router.patch("/", authenticate, PagosController.deletePagos);

// Obtener pagos por transacción
router.get(
  "/:id_transaccion/pagos",
  authenticate,
  PagosController.obtenerPagosPorTransaccion
);

// Cambiar el estado de un pago
router.patch(
  "/:id_pago/estado",
  authenticate,
  PagosController.cambiarEstadoPago
);

router.post(
  "/:id/nuevo-metodo-pago",
  authenticate,
  PagosController.registrarMetodoPago
);

export default router;

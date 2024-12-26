import { Router } from "express";
import FacturaController from "../controllers/FacturaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";

const router = Router();

// Obtener todas las facturas (con filtros y paginación)
router.get("/", authenticate, FacturaController.getAllFacturas);

// Obtener una factura por ID
router.get("/:id",authenticate, FacturaController.getFacturaById);

// Crear una factura desde una transacción
router.post("/desde-transaccion", authenticate,FacturaController.crearFacturaDesdeTransaccion);

// Crear una factura independiente
router.post("/", authenticate, FacturaController.crearFacturaIndependiente);

// Eliminar multiple
router.patch("/", authenticate,FacturaController.deleteFacturas);

// Actualizar el estado de una factura
router.put("/:id/estado", authenticate,FacturaController.actualizarEstadoFactura);

// Actualizar factura
router.put("/:id",authenticate, FacturaController.actualizarFactura);

// Eliminar una factura
router.patch("/:id",authenticate, FacturaController.eliminarFactura);

export default router;

import { Router } from "express";
import FacturaController from "../controllers/FacturaController.js";

const router = Router();

// Obtener todas las facturas (con filtros y paginación)
router.get("/", FacturaController.getAllFacturas);

// Obtener una factura por ID
router.get("/:id", FacturaController.getFacturaById);

// Crear una factura desde una transacción
router.post("/desde-transaccion", FacturaController.crearFacturaDesdeTransaccion);

// Crear una factura independiente
router.post("/", FacturaController.crearFacturaIndependiente);

// Actualizar el estado de una factura
router.put("/:id/estado", FacturaController.actualizarEstadoFactura);

// Eliminar una factura
router.delete("/:id", FacturaController.eliminarFactura);

export default router;

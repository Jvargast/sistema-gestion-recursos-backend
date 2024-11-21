import { Router } from "express";
import DetalleTransaccionController from "../controllers/DetalleTransaccionController.js";

const router = Router();

router.get("/:id_transaccion", DetalleTransaccionController.getDetallesByTransaccionId); // Obtener detalles por transacción
router.post("/:id_transaccion", DetalleTransaccionController.createDetalles); // Agregar detalles a una transacción
router.put("/:id_detalle", DetalleTransaccionController.updateDetalle); // Actualizar un detalle de transacción
router.delete("/", DetalleTransaccionController.deleteDetalles); // Eliminar detalles de una transacción
router.get("/:id_transaccion/totales", DetalleTransaccionController.calcularTotales); // Calcular totales de una transacción

export default router;

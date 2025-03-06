import { Router } from "express";
import EstadoVentaController from "../controllers/EstadoVentaController.js";


const router = Router();

//Agregar controlador de EstadoVenta, solo poder obtener nada más, crear no

router.get("/:id", EstadoVentaController.getEstadoVentaById); // Obtener estado por ID
router.get("/", EstadoVentaController.getAllEstadosVentas); // Obtener todos los estados
/* router.post("/", EstadoVentaController.createEstado); // Crear un estado
router.put("/:id", EstadoVentaController.updateEstado); // Actualizar un estado
router.delete("/:id", EstadoVentaController.deleteEstado); // Eliminar un estado */

export default router;

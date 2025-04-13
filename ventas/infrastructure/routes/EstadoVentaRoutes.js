import { Router } from "express";
import EstadoVentaController from "../controllers/EstadoVentaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";


const router = Router();
router.use(authenticate);

router.get("/:id", checkPermissions("ventas.estadoventa.ver"), EstadoVentaController.getEstadoVentaById); // Obtener estado por ID
router.get("/", checkPermissions("ventas.estadoventa.ver"), EstadoVentaController.getAllEstadosVentas); // Obtener todos los estados
/* router.post("/", EstadoVentaController.createEstado); // Crear un estado
router.put("/:id", EstadoVentaController.updateEstado); // Actualizar un estado
router.delete("/:id", EstadoVentaController.deleteEstado); // Eliminar un estado */

export default router;

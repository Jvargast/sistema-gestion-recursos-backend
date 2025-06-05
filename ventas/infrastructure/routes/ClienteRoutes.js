import { Router } from "express";
import ClienteController from "../controllers/ClienteController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();

router.use(authenticate);


router.get("/", checkPermissions("ventas.cliente.ver"), ClienteController.getAllClientes);
router.get("/:id", checkPermissions("ventas.cliente.ver"), ClienteController.getClienteById); 
router.get("/nuevos/porcentaje", checkPermissions("ventas.cliente.porcentaje"), ClienteController.getPorcentajeClientesNuevos);
router.post("/", checkPermissions("ventas.cliente.crear"), ClienteController.createCliente); 
router.put("/:id", checkPermissions("ventas.cliente.editar"), ClienteController.updateCliente); 
router.patch("/", checkPermissions("ventas.cliente.eliminar"), ClienteController.deleteClientes);
router.patch("/:id/deactivate", checkPermissions("ventas.cliente.desactivar"), ClienteController.deactivateCliente); 
router.patch("/:id/reactivate", checkPermissions("ventas.cliente.reactivar"), ClienteController.reactivateCliente); 
router.get("/search", checkPermissions("ventas.cliente.buscar"), ClienteController.searchClientes); 
export default router;

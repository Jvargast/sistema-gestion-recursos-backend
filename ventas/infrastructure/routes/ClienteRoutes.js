import { Router } from "express";
import ClienteController from "../controllers/ClienteController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();

router.use(authenticate);


router.get("/", checkPermissions("ventas.cliente.ver"), ClienteController.getAllClientes);
router.get("/:id", checkPermissions("ventas.cliente.ver"), ClienteController.getClienteById); // Obtener cliente por ID
router.get("/nuevos/porcentaje", checkPermissions("ventas.cliente.porcentaje"), ClienteController.getPorcentajeClientesNuevos);
router.post("/", checkPermissions("ventas.cliente.crear"), ClienteController.createCliente); // Crear un cliente
router.put("/:id", checkPermissions("ventas.cliente.editar"), ClienteController.updateCliente); // Actualizar un cliente
router.patch("/", checkPermissions("ventas.cliente.eliminar"), ClienteController.deleteClientes);
router.patch("/:id/deactivate", checkPermissions("ventas.cliente.desactivar"), ClienteController.deactivateCliente); // Desactivar un cliente
router.patch("/:id/reactivate", checkPermissions("ventas.cliente.reactivar"), ClienteController.reactivateCliente); // Reactivar un cliente
router.get("/search", checkPermissions("ventas.cliente.buscar"), ClienteController.searchClientes); // Buscar clientes con filtros

export default router;

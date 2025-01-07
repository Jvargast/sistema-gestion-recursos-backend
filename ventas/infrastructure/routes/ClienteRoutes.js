import { Router } from "express";
import ClienteController from "../controllers/ClienteController.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";
import authenticate from "../../../shared/middlewares/authenticate.js";

const router = Router();

router.use(verifyToken);


router.get("/", authenticate, ClienteController.getAllClientes);
router.get("/:id", authenticate, ClienteController.getClienteById); // Obtener cliente por ID
router.get("/nuevos/porcentaje", authenticate, ClienteController.getPorcentajeClientesNuevos);
router.post("/", authenticate, ClienteController.createCliente); // Crear un cliente
router.put("/:id", authenticate, ClienteController.updateCliente); // Actualizar un cliente
router.patch("/", authenticate, ClienteController.deleteClientes);
router.patch("/:id/deactivate", authenticate, ClienteController.deactivateCliente); // Desactivar un cliente
router.patch("/:id/reactivate", authenticate, ClienteController.reactivateCliente); // Reactivar un cliente
router.get("/search", authenticate, ClienteController.searchClientes); // Buscar clientes con filtros

export default router;

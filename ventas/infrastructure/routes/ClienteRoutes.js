import { Router } from "express";
import ClienteController from "../controllers/ClienteController.js";

const router = Router();

router.get("/:id", ClienteController.getClienteById); // Obtener cliente por ID
router.get("/", ClienteController.getAllClientes); // Obtener todos los clientes con filtros y paginación
router.post("/", ClienteController.createCliente); // Crear un cliente
router.put("/:id", ClienteController.updateCliente); // Actualizar un cliente
router.patch("/:id/deactivate", ClienteController.deactivateCliente); // Desactivar un cliente
router.patch("/:id/reactivate", ClienteController.reactivateCliente); // Reactivar un cliente
router.get("/search", ClienteController.searchClientes); // Buscar clientes con filtros

export default router;

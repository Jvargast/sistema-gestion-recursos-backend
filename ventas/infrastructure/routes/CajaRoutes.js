import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import CajaController from "../controllers/CajaController.js";

const router = Router();

// Rutas específicas primero
router.get("/", authenticate, CajaController.getAllCajas);
router.get("/estado", authenticate, CajaController.getEstadoCaja);
router.get("/asignada", authenticate, CajaController.getCajaAsignada);
router.put("/asignar", authenticate, CajaController.asignarCaja);
router.post("/abrir", authenticate, CajaController.openCaja);
router.post("/cerrar", authenticate, CajaController.closeCaja);

// Rutas dinámicas al final
router.get("/:id", authenticate, CajaController.getCajaById);
router.put("/:id", authenticate, CajaController.updateCaja);
router.post("/", authenticate, CajaController.createCaja);


export default router;
